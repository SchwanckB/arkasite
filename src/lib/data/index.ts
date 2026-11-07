/**
 * ARKA - camada de dados do site publico.
 *
 * ESTA E A UNICA PORTA DE ENTRADA DE DADOS DAS SECOES.
 * As secoes nunca importam src/content/* diretamente; elas chamam estas funcoes.
 *
 * Nesta versao (Parte 0) os dados vem de src/content/*. A Parte 7 reimplementa
 * tudo com Supabase MANTENDO EXATAMENTE ESTAS ASSINATURAS, e usando src/content/*
 * como reserva automatica quando o banco nao estiver configurado ou falhar.
 * O site nunca pode quebrar por falta de banco.
 *
 * Todas as leituras sao cacheadas com tag (ver ./tags.ts) para que as mutacoes
 * do painel consigam revalidar o site publico.
 */

import { cacheTag } from "next/cache";

import { brand as conteudoBrand } from "@/content/brand";
import { differentials as conteudoDifferentials } from "@/content/differentials";
import { processSteps as conteudoProcess } from "@/content/process";
import { projects as conteudoProjects } from "@/content/projects";
import { sections as conteudoSections } from "@/content/sections";
import { services as conteudoServices } from "@/content/services";
import { site as conteudoSite } from "@/content/site";

import { TAGS } from "./tags";
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

/* ------------------------------------------------------------------ */
/* Leitura                                                             */
/* ------------------------------------------------------------------ */

/** Configuracoes gerais: contatos, redes, SEO, mensagem de WhatsApp. */
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(TAGS.settings, TAGS.site);
  return conteudoSite;
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
  const todas = porOrdem(conteudoSections);
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
  return porOrdem(conteudoServices).filter((s) => s.publicado);
}

/** Os pilares da marca, ordenados. */
export async function getDifferentials(): Promise<Differential[]> {
  "use cache";
  cacheTag(TAGS.differentials, TAGS.site);
  return porOrdem(conteudoDifferentials);
}

/** As 4 etapas do processo, na ordem. */
export async function getProcessSteps(): Promise<ProcessStep[]> {
  "use cache";
  cacheTag(TAGS.process, TAGS.site);
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

  let lista = porOrdem(conteudoProjects);
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

  return {
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
}

/** Perguntas frequentes, na ordem em que devem aparecer. */
export async function getFaq(): Promise<Faq[]> {
  "use cache";
  cacheTag(TAGS.sections, TAGS.site);
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
  const googleAdsId = ouNulo(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID);
  const googleAnalyticsId = ouNulo(process.env.NEXT_PUBLIC_GA_ID);
  const gtmId = ouNulo(process.env.NEXT_PUBLIC_GTM_ID);

  return {
    googleAdsId,
    googleAdsConversao: ouNulo(process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSAO),
    googleAnalyticsId,
    gtmId,
    // Desligado explicitamente por NEXT_PUBLIC_RASTREAMENTO_ATIVO=false.
    ativo: process.env.NEXT_PUBLIC_RASTREAMENTO_ATIVO !== "false",
  };
}
