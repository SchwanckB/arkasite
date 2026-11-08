/**
 * ARKA - camada de dados do site publico.
 *
 * ESTA E A UNICA PORTA DE ENTRADA DE DADOS DAS SECOES.
 * As secoes nunca importam src/content/* diretamente; elas chamam estas funcoes.
 *
 * As leituras usam o Supabase quando configurado e src/content/* como reserva
 * quando o banco nao estiver configurado ou uma consulta falhar. O site nunca
 * pode quebrar por falta de banco.
 *
 * Todas as leituras sao cacheadas com tag (ver ./tags.ts) para que as mutacoes
 * do painel consigam revalidar o site publico.
 */

import { cacheTag } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { brand as conteudoBrand } from "@/content/brand";
import { differentials as conteudoDifferentials } from "@/content/differentials";
import { processSteps as conteudoProcess } from "@/content/process";
import { projects as conteudoProjects } from "@/content/projects";
import { sections as conteudoSections } from "@/content/sections";
import { services as conteudoServices } from "@/content/services";
import { site as conteudoSite } from "@/content/site";

import { TAGS } from "./tags";
import { credenciaisPublicas, supabaseConfigurado } from "@/lib/supabase/env";
import type {
  BrandContent,
  Differential,
  Faq,
  LeadInput,
  LeadResult,
  ProcessStep,
  Project,
  Section,
  SectionId,
  Service,
  SiteSettings,
  TrackingSettings,
} from "./types";

export * from "./types";
export { TAGS } from "./tags";

/** Ordena por `ordem` sem alterar o array de origem. */
function porOrdem<T extends { ordem: number }>(itens: readonly T[]): T[] {
  return [...itens].sort((a, b) => a.ordem - b.ordem);
}

function clientePublico() {
  if (!supabaseConfigurado()) return null;
  const { url, anonKey } = credenciaisPublicas();
  return createSupabaseClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function registrarFalhaPublica(area: string, message: string) {
  console.error(`[data:${area}] Supabase indisponível; usando conteúdo de reserva. ${message}`);
}

type SettingsRow = { chave: string; valor: Record<string, unknown> };
const esquemaBrand = z.object({
  manifesto: z.object({ paragrafos: z.array(z.string()), assinatura: z.string() }),
  missao: z.string(),
  visao: z.string(),
  valores: z.array(z.object({ nome: z.string(), descricao: z.string() })),
  sobre: z.object({ curto: z.string(), longo: z.array(z.string()) }),
  indicadores: z.array(z.object({ titulo: z.string(), descricao: z.string() })),
});

async function lerSettingsPublicos(): Promise<Map<string, Record<string, unknown>> | null> {
  const supabase = clientePublico();
  if (!supabase) return null;
  const { data, error } = await supabase.from("site_settings").select("chave,valor");
  if (error) {
    registrarFalhaPublica("settings", error.message);
    return null;
  }
  return new Map(((data ?? []) as SettingsRow[]).map((row) => [row.chave, row.valor]));
}

/* ------------------------------------------------------------------ */
/* Leitura                                                             */
/* ------------------------------------------------------------------ */

/** Configuracoes gerais: contatos, redes, SEO, mensagem de WhatsApp. */
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(TAGS.settings, TAGS.site);
  const settings = await lerSettingsPublicos();
  if (!settings) return conteudoSite;
  const geral = settings.get("geral") ?? {};
  const contato = settings.get("contato") ?? {};
  const redes = settings.get("redes") ?? {};
  const seo = settings.get("seo") ?? {};
  const stringValue = (obj: Record<string, unknown>, key: string, fallback: string) => {
    if (!Object.hasOwn(obj, key)) return fallback;
    return typeof obj[key] === "string" ? obj[key] as string : "";
  };
  return {
    ...conteudoSite,
    nome: stringValue(geral, "nome", conteudoSite.nome),
    tagline: stringValue(geral, "tagline", conteudoSite.tagline),
    descricao: stringValue(geral, "descricao", conteudoSite.descricao),
    url: stringValue(geral, "url", conteudoSite.url),
    contato: {
      ...conteudoSite.contato,
      email: stringValue(contato, "email", conteudoSite.contato.email),
      whatsapp: stringValue(contato, "whatsapp", conteudoSite.contato.whatsapp),
      whatsappDigitos: stringValue(contato, "whatsapp_digitos", conteudoSite.contato.whatsappDigitos),
      cidade: stringValue(contato, "cidade", conteudoSite.contato.cidade ?? ""),
    },
    redes: {
      instagram: stringValue(redes, "instagram", conteudoSite.redes.instagram ?? ""),
      linkedin: stringValue(redes, "linkedin", conteudoSite.redes.linkedin ?? "") || undefined,
      facebook: stringValue(redes, "facebook", conteudoSite.redes.facebook ?? "") || undefined,
    },
    mensagemWhatsapp: stringValue(contato, "mensagem_whatsapp", conteudoSite.mensagemWhatsapp),
    seo: {
      titulo: stringValue(seo, "titulo", conteudoSite.seo.titulo),
      descricao: stringValue(seo, "descricao", conteudoSite.seo.descricao),
      imagemOg: stringValue(seo, "imagem_og", conteudoSite.seo.imagemOg),
      googleVerification: stringValue(seo, "google_verification", conteudoSite.seo.googleVerification),
    },
  };
}

/**
 * Secoes visiveis do site, ja ordenadas.
 * Passe `{ incluirOcultas: true }` para obter tambem as desligadas (uso do painel).
 */
export async function getSections(opcoes?: {
  incluirOcultas?: boolean;
}): Promise<Section[]> {
  "use cache";
  cacheTag(TAGS.sections, TAGS.site);
  const supabase = clientePublico();
  let base = conteudoSections;
  if (supabase) {
    const { data, error } = await supabase.from("site_sections").select("*").order("ordem");
    if (error) registrarFalhaPublica("sections", error.message);
    else if (data?.length) {
      const byId = new Map(data.map((row) => [row.id, row]));
      base = conteudoSections.map((section) => {
        const row = byId.get(section.id);
        if (!row || (row.rascunho && !row.titulo)) return section;
        return {
          ...section, titulo: row.titulo, subtitulo: row.subtitulo ?? undefined,
          descricao: row.descricao ?? undefined, visivel: row.visivel,
          ordem: row.ordem, conteudo: row.conteudo,
        };
      });
    }
  }
  const todas = porOrdem(base);
  return opcoes?.incluirOcultas ? todas : todas.filter((s) => s.visivel);
}

/** Uma secao especifica. Devolve undefined se nao existir ou estiver oculta. */
export async function getSection(id: SectionId): Promise<Section | undefined> {
  const secoes = await getSections({ incluirOcultas: true });
  return secoes.find((s) => s.id === id);
}

/** Servicos publicados, ordenados. */
export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheTag(TAGS.services, TAGS.site);
  const supabase = clientePublico();
  if (supabase) {
    const { data, error } = await supabase.from("services").select("*").order("ordem");
    if (error) registrarFalhaPublica("services", error.message);
    else return (data ?? []).filter((row) => row.publicado).map((row) => ({
      id: row.id, slug: row.slug, nome: row.nome, descricao: row.descricao,
      entregas: row.entregas, icone: row.icone, ordem: row.ordem, publicado: row.publicado,
    }));
  }
  return porOrdem(conteudoServices).filter((s) => s.publicado);
}

/** Os pilares da marca, ordenados. */
export async function getDifferentials(): Promise<Differential[]> {
  "use cache";
  cacheTag(TAGS.differentials, TAGS.site);
  const supabase = clientePublico();
  if (supabase) {
    const { data, error } = await supabase.from("differentials").select("*").order("ordem");
    if (error) registrarFalhaPublica("differentials", error.message);
    else return (data ?? []).map((row) => ({
      id: row.id, titulo: row.titulo, descricao: row.descricao,
      apoio: row.apoio ?? undefined, icone: row.icone, ordem: row.ordem,
    }));
  }
  return porOrdem(conteudoDifferentials);
}

/** As 4 etapas do processo, na ordem. */
export async function getProcessSteps(): Promise<ProcessStep[]> {
  "use cache";
  cacheTag(TAGS.process, TAGS.site);
  const supabase = clientePublico();
  if (supabase) {
    const { data, error } = await supabase.from("process_steps").select("*").order("numero");
    if (error) registrarFalhaPublica("process", error.message);
    else return (data ?? []).map((row) => ({
      id: row.id, numero: row.numero, titulo: row.titulo,
      descricao: row.descricao, detalhe: row.detalhe ?? undefined, icone: row.icone,
    }));
  }
  return [...conteudoProcess].sort((a, b) => a.numero - b.numero);
}

/**
 * Projetos do portfolio.
 * Por padrao devolve apenas os publicados, ordenados.
 */
export async function getProjects(opcoes?: {
  incluirNaoPublicados?: boolean;
  categoria?: string;
}): Promise<Project[]> {
  "use cache";
  cacheTag(TAGS.projects, TAGS.site);

  let lista = conteudoProjects;
  const supabase = clientePublico();
  if (supabase) {
    const { data, error } = await supabase.from("projects").select("*").order("ordem");
    if (error) registrarFalhaPublica("projects", error.message);
    else lista = (data ?? []).map((row) => ({
      id: row.id, slug: row.slug, nome: row.nome, categoria: row.categoria,
      descricao: row.descricao, dispositivo: row.dispositivo, variante: row.variante,
      isConcept: row.is_concept, liveUrl: row.live_url ?? undefined,
      coverUrl: row.cover_url ?? undefined, coverAlt: row.cover_alt ?? undefined,
      gallery: row.gallery, tags: row.tags, publicado: row.publicado, ordem: row.ordem,
    }));
  }
  lista = porOrdem(lista);
  if (!opcoes?.incluirNaoPublicados) {
    lista = lista.filter((p) => p.publicado);
  }
  if (opcoes?.categoria) {
    lista = lista.filter((p) => p.categoria === opcoes.categoria);
  }
  return lista;
}

/** Um projeto pelo slug. */
export async function getProject(slug: string): Promise<Project | undefined> {
  const lista = await getProjects({ incluirNaoPublicados: true });
  return lista.find((p) => p.slug === slug);
}

/**
 * Textos institucionais da marca: manifesto, missao, visao, valores,
 * "sobre" curto e longo, e os indicadores de diferenciacao.
 */
export async function getBrand(): Promise<BrandContent> {
  "use cache";
  cacheTag(TAGS.settings, TAGS.site);

  const settings = await lerSettingsPublicos();
  const stored = settings?.get("brand");
  const base: BrandContent = {
    manifesto: {
      paragrafos: [...conteudoBrand.manifesto.paragrafos],
      assinatura: conteudoBrand.manifesto.assinatura,
    },
    missao: conteudoBrand.missao,
    visao: conteudoBrand.visao,
    valores: conteudoBrand.valores.map((v) => ({ ...v })),
    sobre: {
      curto: conteudoBrand.sobre.curto,
      longo: [...conteudoBrand.sobre.longo],
    },
    indicadores: conteudoBrand.indicadores.map((i) => ({ ...i })),
  };
  const parsed = stored ? esquemaBrand.safeParse(stored) : null;
  return parsed?.success ? { ...base, ...parsed.data } : base;
}

/** Perguntas frequentes, na ordem em que devem aparecer. */
export async function getFaq(): Promise<Faq[]> {
  "use cache";
  cacheTag(TAGS.sections, TAGS.site);
  const supabase = clientePublico();
  if (supabase) {
    const { data, error } = await supabase.from("faq").select("id,pergunta,resposta,publicado").order("ordem");
    if (error) registrarFalhaPublica("faq", error.message);
    else return (data ?? []).filter((item) => item.publicado).map((item) => ({
      id: item.id, pergunta: item.pergunta, resposta: item.resposta,
    }));
  }
  return conteudoBrand.faq.map((p) => ({ ...p }));
}

/* ------------------------------------------------------------------ */
/* Escrita                                                             */
/* ------------------------------------------------------------------ */

/**
 * Registra um lead vindo do formulario de contato.
 *
 * Parte 0: ainda nao ha banco, entao sempre devolve not_configured.
 * A Parte 5 trata esse retorno mostrando um erro honesto com os contatos
 * diretos (WhatsApp e e-mail). A Parte 7 implementa a gravacao real.
 *
 * Contrato: NUNCA lanca excecao. Sempre devolve um LeadResult.
 */
export async function createLead(_entrada: LeadInput): Promise<LeadResult> {
  void _entrada;
  return {
    ok: false,
    reason: "not_configured",
    mensagem:
      "O banco de dados ainda nao foi configurado. Ver docs/SETUP-SUPABASE.md (Parte 7).",
  };
}

/* ------------------------------------------------------------------ */
/* Rastreamento                                                        */
/* ------------------------------------------------------------------ */

/** Devolve null para string vazia ou so espacos. */
function ouNulo(valor: string | undefined): string | null {
  const limpo = valor?.trim();
  return limpo ? limpo : null;
}

/**
 * Identificadores de Google Ads / Analytics / Tag Manager.
 *
 * Nesta versao le das variaveis de ambiente. A Parte 7 passa a ler da
 * chave "rastreamento" de site_settings, caindo para as variaveis de
 * ambiente quando o banco nao tiver valor - assim o dono pode editar pelo
 * painel sem precisar de novo deploy.
 *
 * Nao usa "use cache": sao variaveis de ambiente, ja sao estaticas no build.
 */
export async function getTracking(): Promise<TrackingSettings> {
  "use cache";
  cacheTag(TAGS.settings, TAGS.site);
  const settings = await lerSettingsPublicos();
  const stored = settings?.get("rastreamento");
  const stringValue = (key: string, env: string) => {
    if (stored && Object.hasOwn(stored, key)) {
      const value = stored[key];
      return typeof value === "string" ? ouNulo(value) : null;
    }
    return ouNulo(process.env[env]);
  };

  return {
    googleAdsId: stringValue("google_ads_id", "NEXT_PUBLIC_GOOGLE_ADS_ID"),
    googleAdsConversao: stringValue("google_ads_conversao", "NEXT_PUBLIC_GOOGLE_ADS_CONVERSAO"),
    googleAnalyticsId: stringValue("google_analytics_id", "NEXT_PUBLIC_GA_ID"),
    gtmId: stringValue("gtm_id", "NEXT_PUBLIC_GTM_ID"),
    // Desligado explicitamente por NEXT_PUBLIC_RASTREAMENTO_ATIVO=false.
    ativo: stored && typeof stored.ativo === "boolean"
      ? stored.ativo
      : process.env.NEXT_PUBLIC_RASTREAMENTO_ATIVO !== "false",
  };
}

export async function getAppearanceTheme(): Promise<"musgo" | "grafite"> {
  "use cache";
  cacheTag(TAGS.settings, TAGS.site);
  const settings = await lerSettingsPublicos();
  return settings?.get("aparencia")?.tema === "grafite" ? "grafite" : "musgo";
}
