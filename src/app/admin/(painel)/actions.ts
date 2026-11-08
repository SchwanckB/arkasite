"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { TAGS } from "@/lib/data/tags";
import { requireAuth, requireGerente } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

function valor(form: FormData, chave: string): string {
  const campo = form.get(chave);
  return typeof campo === "string" ? campo.trim() : "";
}

function opcional(texto: string): string | null {
  return texto || null;
}

function falharSeErro(erro: { message: string } | null) {
  if (erro) throw new Error(`Não foi possível salvar: ${erro.message}`);
}

function atualizarPainel(...rotas: string[]) {
  for (const rota of rotas) revalidatePath(rota);
}

function atualizarSite(...tags: (typeof TAGS)[keyof typeof TAGS][]) {
  for (const tag of tags) revalidateTag(tag, "max");
  atualizarPainel("/admin", "/admin/site", "/admin/portfolio", "/admin/configuracoes", "/admin/aparencia");
}

const uuid = z.string().uuid("Identificador inválido.");
const textoCurto = z.string().trim().min(1, "Preencha os campos obrigatórios.");
const urlHttp = z.string().trim().url().refine((value) => {
  try {
    const protocolo = new URL(value).protocol;
    return protocolo === "https:" || protocolo === "http:";
  } catch {
    return false;
  }
}, "Informe um endereço HTTP ou HTTPS.");

export async function atualizarLead(form: FormData) {
  await requireAuth();
  const dados = z.object({
    id: uuid,
    status: z.enum(["novo", "em_contato", "qualificado", "convertido", "descartado"]),
  }).parse({ id: valor(form, "id"), status: valor(form, "status") });
  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ status: dados.status }).eq("id", dados.id);
  falharSeErro(error);
  atualizarPainel("/admin/crm", "/admin");
}

export async function registrarInteracao(form: FormData) {
  const usuario = await requireAuth();
  const dados = z.object({
    lead_id: z.union([uuid, z.literal("")]),
    client_id: z.union([uuid, z.literal("")]),
    tipo: z.enum(["ligacao", "whatsapp", "reuniao", "email", "nota"]),
    descricao: z.string().trim().min(1).max(4000),
  }).parse({
    lead_id: valor(form, "lead_id"),
    client_id: valor(form, "client_id"),
    tipo: valor(form, "tipo"),
    descricao: valor(form, "descricao"),
  });
  if (!dados.lead_id && !dados.client_id) throw new Error("Escolha um lead ou cliente.");
  const supabase = await createClient();
  const { error } = await supabase.from("interactions").insert({
    lead_id: dados.lead_id || null,
    client_id: dados.client_id || null,
    tipo: dados.tipo,
    descricao: dados.descricao,
    criado_por: usuario.id,
  });
  falharSeErro(error);
  atualizarPainel("/admin/crm", "/admin/clientes");
}

export async function converterLead(form: FormData) {
  await requireAuth();
  const dados = z.object({
    id: uuid,
    empresa: textoCurto.max(200),
    responsavel: z.string().trim().max(120),
  }).parse({
    id: valor(form, "id"),
    empresa: valor(form, "empresa"),
    responsavel: valor(form, "responsavel"),
  });
  const supabase = await createClient();
  const { data: lead, error: erroLead } = await supabase.from("leads")
    .select("id,nome,email,telefone,empresa,status").eq("id", dados.id).single();
  falharSeErro(erroLead);
  if (!lead) throw new Error("Lead não encontrado.");
  const { data: clienteExistente, error: erroClienteExistente } = await supabase.from("clients")
    .select("id").eq("lead_id", lead.id).maybeSingle();
  falharSeErro(erroClienteExistente);
  if (clienteExistente) {
    const { error } = await supabase.from("leads").update({ status: "convertido" }).eq("id", lead.id);
    falharSeErro(error);
    atualizarPainel("/admin/crm", "/admin/clientes", "/admin");
    return;
  }
  const { error: erroCliente } = await supabase.from("clients").insert({
    empresa: dados.empresa,
    responsavel: dados.responsavel || lead.nome,
    email: lead.email,
    telefone: lead.telefone,
    lead_id: lead.id,
  });
  falharSeErro(erroCliente);
  const { error } = await supabase.from("leads").update({ status: "convertido" }).eq("id", lead.id);
  falharSeErro(error);
  atualizarPainel("/admin/crm", "/admin/clientes", "/admin");
}

export async function salvarNegocio(form: FormData) {
  await requireAuth();
  const dados = z.object({
    id: z.union([uuid, z.literal("")]),
    titulo: textoCurto.max(200),
    lead_id: z.union([uuid, z.literal("")]),
    etapa: z.enum(["novo", "contato_feito", "proposta_enviada", "negociacao", "ganho", "perdido"]),
    valor_cents: z.coerce.number().int().min(0),
    motivo_perda: z.string().trim().max(1000),
  }).parse({
    id: valor(form, "id"), titulo: valor(form, "titulo"),
    lead_id: valor(form, "lead_id"), etapa: valor(form, "etapa"),
    valor_cents: valor(form, "valor_cents") || "0",
    motivo_perda: valor(form, "motivo_perda"),
  });
  const supabase = await createClient();
  const payload = {
    titulo: dados.titulo, lead_id: dados.lead_id || null,
    etapa: dados.etapa, valor_cents: dados.valor_cents,
    motivo_perda: opcional(dados.motivo_perda),
  };
  const { error } = dados.id
    ? await supabase.from("deals").update(payload).eq("id", dados.id)
    : await supabase.from("deals").insert(payload);
  falharSeErro(error);
  atualizarPainel("/admin/crm", "/admin");
}

export async function excluirNegocio(form: FormData) {
  await requireAuth();
  const supabase = await createClient();
  const { error } = await supabase.from("deals").delete().eq("id", uuid.parse(valor(form, "id")));
  falharSeErro(error);
  atualizarPainel("/admin/crm");
}

export async function salvarCliente(form: FormData) {
  await requireAuth();
  const id = valor(form, "id");
  const dados = z.object({
    empresa: textoCurto.max(200),
    responsavel: z.string().trim().max(120),
    email: z.union([z.literal(""), z.string().trim().email().max(200)]),
    telefone: z.string().trim().max(50),
    documento: z.string().trim().max(40),
    endereco: z.string().trim().max(500),
    observacoes: z.string().trim().max(4000),
  }).parse({
    empresa: valor(form, "empresa"), responsavel: valor(form, "responsavel"),
    email: valor(form, "email"), telefone: valor(form, "telefone"),
    documento: valor(form, "documento"), endereco: valor(form, "endereco"),
    observacoes: valor(form, "observacoes"),
  });
  const supabase = await createClient();
  const payload = {
    empresa: dados.empresa, responsavel: opcional(dados.responsavel),
    email: opcional(dados.email), telefone: opcional(dados.telefone),
    documento: opcional(dados.documento), endereco: opcional(dados.endereco),
    observacoes: opcional(dados.observacoes),
  };
  const { error } = id
    ? await supabase.from("clients").update(payload).eq("id", uuid.parse(id))
    : await supabase.from("clients").insert(payload);
  falharSeErro(error);
  atualizarPainel("/admin/clientes", "/admin");
}

export async function excluirCliente(form: FormData) {
  await requireAuth();
  const id = uuid.parse(valor(form, "id"));
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  falharSeErro(error);
  atualizarPainel("/admin/clientes", "/admin/projetos", "/admin/tarefas");
}

export async function salvarContatoCliente(form: FormData) {
  await requireAuth();
  const dados = z.object({
    id: z.union([uuid, z.literal("")]), client_id: uuid,
    nome: textoCurto.max(120), cargo: z.string().trim().max(120),
    email: z.union([z.literal(""), z.string().trim().email().max(200)]),
    telefone: z.string().trim().max(50), principal: z.enum(["true", "false"]),
  }).parse({
    id: valor(form, "id"), client_id: valor(form, "client_id"),
    nome: valor(form, "nome"), cargo: valor(form, "cargo"),
    email: valor(form, "email"), telefone: valor(form, "telefone"),
    principal: valor(form, "principal"),
  });
  const supabase = await createClient();
  if (dados.principal === "true") {
    const { error } = await supabase.from("client_contacts").update({ principal: false })
      .eq("client_id", dados.client_id).eq("principal", true);
    falharSeErro(error);
  }
  const payload = {
    client_id: dados.client_id, nome: dados.nome,
    cargo: opcional(dados.cargo), email: opcional(dados.email),
    telefone: opcional(dados.telefone), principal: dados.principal === "true",
  };
  const { error } = dados.id
    ? await supabase.from("client_contacts").update(payload).eq("id", dados.id)
    : await supabase.from("client_contacts").insert(payload);
  falharSeErro(error);
  atualizarPainel("/admin/clientes");
}

export async function excluirContatoCliente(form: FormData) {
  await requireAuth();
  const supabase = await createClient();
  const { error } = await supabase.from("client_contacts").delete().eq("id", uuid.parse(valor(form, "id")));
  falharSeErro(error);
  atualizarPainel("/admin/clientes");
}

export async function salvarProjetoCliente(form: FormData) {
  await requireAuth();
  const id = valor(form, "id");
  const dados = z.object({
    client_id: uuid,
    nome: textoCurto.max(200),
    etapa: z.enum(["conversa", "planejamento", "desenvolvimento", "entrega"]),
    status: z.enum(["ativo", "pausado", "concluido", "cancelado"]),
    valor_cents: z.coerce.number().int().min(0),
    prazo: z.union([z.literal(""), z.string().date()]),
  }).parse({
    client_id: valor(form, "client_id"), nome: valor(form, "nome"),
    etapa: valor(form, "etapa"), status: valor(form, "status"),
    valor_cents: valor(form, "valor_cents"), prazo: valor(form, "prazo"),
  });
  const supabase = await createClient();
  const payload = { ...dados, prazo: dados.prazo || null };
  const { error } = id
    ? await supabase.from("client_projects").update(payload).eq("id", uuid.parse(id))
    : await supabase.from("client_projects").insert(payload);
  falharSeErro(error);
  atualizarPainel("/admin/projetos", "/admin/tarefas", "/admin/financeiro", "/admin");
}

export async function excluirProjetoCliente(form: FormData) {
  await requireAuth();
  const supabase = await createClient();
  const { error } = await supabase.from("client_projects").delete().eq("id", uuid.parse(valor(form, "id")));
  falharSeErro(error);
  atualizarPainel("/admin/projetos", "/admin/tarefas", "/admin/financeiro");
}

export async function salvarTarefa(form: FormData) {
  await requireAuth();
  const id = valor(form, "id");
  const dados = z.object({
    titulo: textoCurto.max(200),
    descricao: z.string().trim().max(4000),
    vence_em: z.union([z.literal(""), z.string().date()]),
    prioridade: z.enum(["baixa", "media", "alta"]),
    client_id: z.union([uuid, z.literal("")]),
    client_project_id: z.union([uuid, z.literal("")]),
  }).parse({
    titulo: valor(form, "titulo"), descricao: valor(form, "descricao"),
    vence_em: valor(form, "vence_em"), prioridade: valor(form, "prioridade"),
    client_id: valor(form, "client_id"), client_project_id: valor(form, "client_project_id"),
  });
  const supabase = await createClient();
  const payload = {
    titulo: dados.titulo, descricao: opcional(dados.descricao),
    vence_em: dados.vence_em || null, prioridade: dados.prioridade,
    client_id: dados.client_id || null, client_project_id: dados.client_project_id || null,
  };
  const { error } = id
    ? await supabase.from("tasks").update(payload).eq("id", uuid.parse(id))
    : await supabase.from("tasks").insert(payload);
  falharSeErro(error);
  atualizarPainel("/admin/tarefas", "/admin");
}

export async function alternarTarefa(form: FormData) {
  await requireAuth();
  const id = uuid.parse(valor(form, "id"));
  const concluida = valor(form, "concluida") === "true";
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({
    concluida: !concluida, concluida_em: !concluida ? new Date().toISOString() : null,
  }).eq("id", id);
  falharSeErro(error);
  atualizarPainel("/admin/tarefas", "/admin");
}

export async function excluirTarefa(form: FormData) {
  await requireAuth();
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", uuid.parse(valor(form, "id")));
  falharSeErro(error);
  atualizarPainel("/admin/tarefas");
}

export async function salvarLancamento(form: FormData) {
  await requireGerente();
  const dados = z.object({
    id: z.union([uuid, z.literal("")]),
    tipo: z.enum(["in", "out"]),
    descricao: textoCurto.max(300),
    amount_cents: z.coerce.number().int().positive(),
    competencia: z.string().date(),
    vencimento: z.union([z.literal(""), z.string().date()]),
    account_id: z.union([uuid, z.literal("")]),
    category_id: z.union([uuid, z.literal("")]),
    status: z.enum(["pending", "paid", "overdue"]),
  }).parse({
    id: valor(form, "id"), tipo: valor(form, "tipo"), descricao: valor(form, "descricao"),
    amount_cents: valor(form, "amount_cents"), competencia: valor(form, "competencia"),
    vencimento: valor(form, "vencimento"), account_id: valor(form, "account_id"),
    category_id: valor(form, "category_id"), status: valor(form, "status"),
  });
  const supabase = await createClient();
  const { id, ...dadosLancamento } = dados;
  const payload = {
    ...dadosLancamento,
    vencimento: dados.vencimento || null,
    account_id: dados.account_id || null,
    category_id: dados.category_id || null,
    pago_em: dados.status === "paid" ? new Date().toISOString().slice(0, 10) : null,
  };
  const { error } = id
    ? await supabase.from("transactions").update(payload).eq("id", id)
    : await supabase.from("transactions").insert(payload);
  falharSeErro(error);
  atualizarPainel("/admin/financeiro", "/admin");
}

export async function atualizarStatusLancamento(form: FormData) {
  await requireGerente();
  const dados = z.object({
    id: uuid, status: z.enum(["pending", "paid", "overdue"]),
  }).parse({ id: valor(form, "id"), status: valor(form, "status") });
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").update({
    status: dados.status, pago_em: dados.status === "paid" ? new Date().toISOString().slice(0, 10) : null,
  }).eq("id", dados.id);
  falharSeErro(error);
  atualizarPainel("/admin/financeiro", "/admin");
}

export async function excluirLancamento(form: FormData) {
  await requireGerente();
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", uuid.parse(valor(form, "id")));
  falharSeErro(error);
  atualizarPainel("/admin/financeiro", "/admin");
}

export async function salvarContaFinanceira(form: FormData) {
  await requireGerente();
  const dados = z.object({
    id: z.union([uuid, z.literal("")]),
    nome: textoCurto.max(100),
    tipo: z.enum(["banco", "caixa", "carteira_digital"]),
    saldo_inicial_cents: z.coerce.number().int(),
  }).parse({
    id: valor(form, "id"), nome: valor(form, "nome"), tipo: valor(form, "tipo"),
    saldo_inicial_cents: valor(form, "saldo_inicial_cents") || "0",
  });
  const supabase = await createClient();
  const { id, ...conta } = dados;
  const { error } = id
    ? await supabase.from("finance_accounts").update(conta).eq("id", id)
    : await supabase.from("finance_accounts").insert(conta);
  falharSeErro(error);
  atualizarPainel("/admin/financeiro");
}

export async function salvarCategoriaFinanceira(form: FormData) {
  await requireGerente();
  const dados = z.object({
    id: z.union([uuid, z.literal("")]),
    nome: textoCurto.max(100), tipo: z.enum(["in", "out"]),
  }).parse({ id: valor(form, "id"), nome: valor(form, "nome"), tipo: valor(form, "tipo") });
  const supabase = await createClient();
  const { id, ...categoria } = dados;
  const { error } = id
    ? await supabase.from("finance_categories").update(categoria).eq("id", id)
    : await supabase.from("finance_categories").insert(categoria);
  falharSeErro(error);
  atualizarPainel("/admin/financeiro");
}

export async function alternarContaFinanceira(form: FormData) {
  await requireGerente();
  const id = uuid.parse(valor(form, "id"));
  const ativo = valor(form, "ativo") === "true";
  const supabase = await createClient();
  const { error } = await supabase.from("finance_accounts").update({ ativo: !ativo }).eq("id", id);
  falharSeErro(error);
  atualizarPainel("/admin/financeiro");
}

export async function excluirCategoriaFinanceira(form: FormData) {
  await requireGerente();
  const supabase = await createClient();
  const { error } = await supabase.from("finance_categories").delete().eq("id", uuid.parse(valor(form, "id")));
  falharSeErro(error);
  atualizarPainel("/admin/financeiro");
}

export async function salvarProjetoPortfolio(form: FormData) {
  await requireGerente();
  const id = valor(form, "id");
  const dados = z.object({
    slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    nome: textoCurto.max(120), categoria: z.string().trim().max(100),
    descricao: z.string().trim().min(1).max(2000),
    dispositivo: z.enum(["desktop", "tablet", "mobile"]),
    variante: z.enum(["institucional", "loja", "landing", "servico"]),
    is_concept: z.enum(["true", "false"]),
    live_url: z.union([z.literal(""), urlHttp]),
    cover_url: z.union([z.literal(""), urlHttp]),
    cover_alt: z.string().trim().max(300),
    tags: z.string().trim().max(500),
    gallery: z.string().trim().max(2000),
    publicado: z.enum(["true", "false"]),
    ordem: z.coerce.number().int().min(0),
  }).parse({
    slug: valor(form, "slug"), nome: valor(form, "nome"),
    categoria: valor(form, "categoria"), descricao: valor(form, "descricao"),
    dispositivo: valor(form, "dispositivo"), variante: valor(form, "variante"),
    is_concept: valor(form, "is_concept"), live_url: valor(form, "live_url"),
    cover_url: valor(form, "cover_url"), cover_alt: valor(form, "cover_alt"),
    tags: valor(form, "tags"), gallery: valor(form, "gallery"),
    publicado: valor(form, "publicado"),
    ordem: valor(form, "ordem") || "0",
  });
  if (dados.cover_url && !dados.cover_alt) throw new Error("Informe o texto alternativo da capa.");
  const gallery = dados.gallery.split("\n").map((url) => url.trim()).filter(Boolean);
  if (gallery.length > 20) throw new Error("A galeria pode ter no máximo 20 imagens.");
  for (const url of gallery) urlHttp.parse(url);
  if (dados.is_concept === "false" && dados.publicado === "true" && valor(form, "autorizacao") !== "on") {
    throw new Error("Confirme que possui autorização por escrito do cliente antes de publicar.");
  }
  const supabase = await createClient();
  const payload = {
    ...dados,
    is_concept: dados.is_concept === "true",
    publicado: dados.publicado === "true",
    live_url: dados.live_url || null,
    cover_url: dados.cover_url || null,
    cover_alt: dados.cover_alt || null,
    tags: dados.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    gallery,
  };
  const { error } = id
    ? await supabase.from("projects").update(payload).eq("id", uuid.parse(id))
    : await supabase.from("projects").insert(payload);
  falharSeErro(error);
  atualizarSite(TAGS.projects, TAGS.site);
}

export async function alternarVisibilidadePortfolio(form: FormData) {
  await requireGerente();
  const visivel = z.enum(["true", "false"]).parse(valor(form, "visivel")) === "true";
  const supabase = await createClient();
  const { data: secao, error: erroBusca } = await supabase.from("site_sections")
    .select("rascunho").eq("id", "portfolio").single();
  falharSeErro(erroBusca);
  if (!secao) throw new Error("A seção do portfólio não existe. Execute o seed do Supabase.");

  const rascunho = secao.rascunho && typeof secao.rascunho === "object" && !Array.isArray(secao.rascunho)
    ? { ...secao.rascunho, visivel }
    : secao.rascunho;
  const { error } = await supabase.from("site_sections").update({
    visivel,
    rascunho,
    publicado_em: new Date().toISOString(),
  }).eq("id", "portfolio");
  falharSeErro(error);
  atualizarSite(TAGS.sections, TAGS.site);
}

export async function excluirProjetoPortfolio(form: FormData) {
  await requireGerente();
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", uuid.parse(valor(form, "id")));
  falharSeErro(error);
  atualizarSite(TAGS.projects, TAGS.site);
}

export async function salvarServico(form: FormData) {
  await requireGerente();
  const id = valor(form, "id");
  const dados = z.object({
    slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    nome: textoCurto.max(120), descricao: textoCurto.max(2000),
    entregas: z.string().trim().max(1000),
    icone: z.string().trim().min(1).max(60),
    ordem: z.coerce.number().int().min(0),
    publicado: z.enum(["true", "false"]),
  }).parse({
    slug: valor(form, "slug"), nome: valor(form, "nome"),
    descricao: valor(form, "descricao"), entregas: valor(form, "entregas"),
    icone: valor(form, "icone") || "Globe", ordem: valor(form, "ordem") || "0",
    publicado: valor(form, "publicado"),
  });
  const supabase = await createClient();
  const payload = {
    ...dados, entregas: dados.entregas.split("\n").map((item) => item.trim()).filter(Boolean),
    publicado: dados.publicado === "true",
  };
  const { error } = id
    ? await supabase.from("services").update(payload).eq("id", uuid.parse(id))
    : await supabase.from("services").insert(payload);
  falharSeErro(error);
  atualizarSite(TAGS.services, TAGS.site);
}

export async function excluirServico(form: FormData) {
  await requireGerente();
  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", uuid.parse(valor(form, "id")));
  falharSeErro(error);
  atualizarSite(TAGS.services, TAGS.site);
}

export async function salvarFaq(form: FormData) {
  await requireGerente();
  const dados = z.object({
    id: z.union([uuid, z.literal("")]),
    pergunta: textoCurto.max(500), resposta: textoCurto.max(5000),
    ordem: z.coerce.number().int().min(0), publicado: z.enum(["true", "false"]),
  }).parse({
    id: valor(form, "id"), pergunta: valor(form, "pergunta"),
    resposta: valor(form, "resposta"), ordem: valor(form, "ordem") || "0",
    publicado: valor(form, "publicado"),
  });
  const supabase = await createClient();
  const payload = { pergunta: dados.pergunta, resposta: dados.resposta, ordem: dados.ordem, publicado: dados.publicado === "true" };
  const { error } = dados.id
    ? await supabase.from("faq").update(payload).eq("id", dados.id)
    : await supabase.from("faq").insert(payload);
  falharSeErro(error);
  atualizarSite(TAGS.sections, TAGS.site);
}

export async function excluirFaq(form: FormData) {
  await requireGerente();
  const supabase = await createClient();
  const { error } = await supabase.from("faq").delete().eq("id", uuid.parse(valor(form, "id")));
  falharSeErro(error);
  atualizarSite(TAGS.sections, TAGS.site);
}

export async function salvarDiferencial(form: FormData) {
  await requireGerente();
  const dados = z.object({
    id: z.union([uuid, z.literal("")]),
    titulo: textoCurto.max(200), descricao: textoCurto.max(1000),
    apoio: z.string().trim().max(500), icone: z.string().trim().max(60),
    ordem: z.coerce.number().int().min(0),
  }).parse({
    id: valor(form, "id"), titulo: valor(form, "titulo"),
    descricao: valor(form, "descricao"), apoio: valor(form, "apoio"),
    icone: valor(form, "icone") || "Circle", ordem: valor(form, "ordem") || "0",
  });
  const supabase = await createClient();
  const payload = { titulo: dados.titulo, descricao: dados.descricao, apoio: opcional(dados.apoio), icone: dados.icone, ordem: dados.ordem };
  const { error } = dados.id
    ? await supabase.from("differentials").update(payload).eq("id", dados.id)
    : await supabase.from("differentials").insert(payload);
  falharSeErro(error);
  atualizarSite(TAGS.differentials, TAGS.site);
}

export async function excluirDiferencial(form: FormData) {
  await requireGerente();
  const supabase = await createClient();
  const { error } = await supabase.from("differentials").delete().eq("id", uuid.parse(valor(form, "id")));
  falharSeErro(error);
  atualizarSite(TAGS.differentials, TAGS.site);
}

export async function salvarEtapa(form: FormData) {
  await requireGerente();
  const dados = z.object({
    id: z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    numero: z.coerce.number().int().positive(),
    titulo: textoCurto.max(200), descricao: textoCurto.max(1000),
    detalhe: z.string().trim().max(1000), icone: z.string().trim().max(60),
  }).parse({
    id: valor(form, "id"), numero: valor(form, "numero"),
    titulo: valor(form, "titulo"), descricao: valor(form, "descricao"),
    detalhe: valor(form, "detalhe"), icone: valor(form, "icone") || "Circle",
  });
  const supabase = await createClient();
  const { error } = await supabase.from("process_steps").upsert({
    ...dados, detalhe: opcional(dados.detalhe),
  });
  falharSeErro(error);
  atualizarSite(TAGS.process, TAGS.site);
}

export async function salvarSecao(form: FormData) {
  await requireGerente();
  const dados = z.object({
    id: z.string().trim().min(1).max(80),
    titulo: textoCurto.max(200),
    subtitulo: z.string().trim().max(300),
    descricao: z.string().trim().max(3000),
    visivel: z.enum(["true", "false"]),
    ordem: z.coerce.number().int().min(0),
    conteudo: z.string().trim().max(10000),
  }).parse({
    id: valor(form, "id"), titulo: valor(form, "titulo"),
    subtitulo: valor(form, "subtitulo"), descricao: valor(form, "descricao"),
    visivel: valor(form, "visivel"), ordem: valor(form, "ordem") || "0",
    conteudo: valor(form, "conteudo"),
  });
  let conteudo: Record<string, unknown> = {};
  if (dados.conteudo) {
    try {
      const parsed: unknown = JSON.parse(dados.conteudo);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
      conteudo = parsed as Record<string, unknown>;
      if (Object.values(conteudo).some((value) => typeof value !== "string")) throw new Error();
    } catch {
      throw new Error("O conteúdo adicional precisa ser um objeto JSON válido.");
    }
  }
  const supabase = await createClient();
  const { data: existente, error: erroBusca } = await supabase.from("site_sections")
    .select("id").eq("id", dados.id).maybeSingle();
  falharSeErro(erroBusca);
  const rascunho = {
    titulo: dados.titulo,
    subtitulo: opcional(dados.subtitulo),
    descricao: opcional(dados.descricao),
    visivel: dados.visivel === "true",
    ordem: dados.ordem,
    conteudo,
  };
  const { error } = existente
    ? await supabase.from("site_sections").update({ rascunho }).eq("id", dados.id)
    : await supabase.from("site_sections").insert({
      id: dados.id, rotulo: dados.id, titulo: "", visivel: false,
      ordem: dados.ordem, rascunho,
    });
  falharSeErro(error);
  atualizarPainel("/admin/site");
}

export async function salvarTextosInstitucionais(form: FormData) {
  await requireGerente();
  let bruto: unknown;
  try {
    bruto = JSON.parse(valor(form, "brand"));
  } catch {
    throw new Error("Os textos institucionais precisam estar em JSON válido.");
  }
  const schema = z.object({
    manifesto: z.object({ paragrafos: z.array(textoCurto.max(2000)).min(1).max(20), assinatura: textoCurto.max(300) }),
    missao: textoCurto.max(2000), visao: textoCurto.max(2000),
    valores: z.array(z.object({ nome: textoCurto.max(100), descricao: textoCurto.max(1000) })).max(20),
    sobre: z.object({ curto: textoCurto.max(2000), longo: z.array(textoCurto.max(2000)).max(20) }),
    indicadores: z.array(z.object({ titulo: textoCurto.max(200), descricao: textoCurto.max(1000) })).max(20),
  });
  const dados = schema.parse(bruto);
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({ chave: "brand", valor: dados });
  falharSeErro(error);
  atualizarSite(TAGS.settings, TAGS.site);
}

export async function publicarSecao(form: FormData) {
  await requireGerente();
  const id = z.string().trim().min(1).max(80).parse(valor(form, "id"));
  const supabase = await createClient();
  const { data: secao, error: erroBusca } = await supabase.from("site_sections")
    .select("rascunho").eq("id", id).single();
  falharSeErro(erroBusca);
  if (!secao) throw new Error("Seção não encontrada.");
  if (!secao.rascunho || typeof secao.rascunho !== "object") {
    throw new Error("Esta seção não tem alterações salvas para publicar.");
  }
  const draft = secao.rascunho as {
    titulo?: unknown; subtitulo?: unknown; descricao?: unknown;
    visivel?: unknown; ordem?: unknown; conteudo?: unknown;
  };
  if (typeof draft.titulo !== "string" || typeof draft.visivel !== "boolean" ||
      typeof draft.ordem !== "number" || !draft.conteudo ||
      typeof draft.conteudo !== "object" || Array.isArray(draft.conteudo)) {
    throw new Error("O rascunho da seção está inválido; salve novamente antes de publicar.");
  }
  const { error } = await supabase.from("site_sections").update({
    titulo: draft.titulo, subtitulo: typeof draft.subtitulo === "string" ? draft.subtitulo : null,
    descricao: typeof draft.descricao === "string" ? draft.descricao : null,
    visivel: draft.visivel, ordem: draft.ordem, conteudo: draft.conteudo,
    rascunho: null, publicado_em: new Date().toISOString(),
  }).eq("id", id);
  falharSeErro(error);
  atualizarSite(TAGS.sections, TAGS.site);
}

export async function salvarConfiguracaoSite(form: FormData) {
  await requireGerente();
  const chave = z.enum(["geral", "contato", "redes", "seo", "rastreamento"]).parse(valor(form, "chave"));
  const supabase = await createClient();
  let conteudo: Record<string, unknown>;
  if (chave === "geral") {
    const data = z.object({
      nome: textoCurto.max(120), tagline: z.string().trim().max(300),
      descricao: z.string().trim().max(3000),       url: urlHttp,
    }).parse({
      nome: valor(form, "nome"), tagline: valor(form, "tagline"),
      descricao: valor(form, "descricao"), url: valor(form, "url"),
    });
    conteudo = data;
  } else if (chave === "contato") {
    const data = z.object({
      email: z.string().trim().email().max(200), whatsapp: textoCurto.max(40),
      whatsapp_digitos: z.string().trim().regex(/^\d{10,15}$/),
      cidade: z.string().trim().max(120),
      mensagem_whatsapp: z.string().trim().max(500),
    }).parse({
      email: valor(form, "email"), whatsapp: valor(form, "whatsapp"),
      whatsapp_digitos: valor(form, "whatsapp_digitos").replace(/\D/g, ""),
      cidade: valor(form, "cidade"),
      mensagem_whatsapp: valor(form, "mensagem_whatsapp"),
    });
    conteudo = data;
  } else if (chave === "redes") {
    const parseSocial = (campo: string) => {
      const entrada = valor(form, campo);
      if (!entrada) return null;
      const parsed = urlHttp.parse(entrada);
      return parsed;
    };
    conteudo = {
      instagram: parseSocial("instagram"),
      linkedin: parseSocial("linkedin"),
      facebook: parseSocial("facebook"),
    };
  } else if (chave === "seo") {
    conteudo = z.object({
      titulo: textoCurto.max(200), descricao: textoCurto.max(500),
      imagem_og: z.string().trim().min(1).max(500),
      google_verification: z.string().trim().max(200).regex(/^[A-Za-z0-9_-]*$/, "Código de verificação do Google inválido."),
    }).parse({
      titulo: valor(form, "titulo"), descricao: valor(form, "descricao"),
      imagem_og: valor(form, "imagem_og"),
      google_verification: valor(form, "google_verification"),
    });
  } else {
    const ads = valor(form, "google_ads_id");
    const conversion = valor(form, "google_ads_conversao");
    const analytics = valor(form, "google_analytics_id");
    const gtm = valor(form, "gtm_id");
    if (ads && !/^AW-\d+$/.test(ads)) throw new Error("ID do Google Ads inválido.");
    if (conversion && !/^AW-\d+\/[A-Za-z0-9_-]+$/.test(conversion)) throw new Error("Rótulo de conversão inválido.");
    if (analytics && !/^G-[A-Z0-9]+$/.test(analytics)) throw new Error("ID do Analytics inválido.");
    if (gtm && !/^GTM-[A-Z0-9]+$/.test(gtm)) throw new Error("ID do Tag Manager inválido.");
    conteudo = {
      google_ads_id: opcional(ads), google_ads_conversao: opcional(conversion),
      google_analytics_id: opcional(analytics), gtm_id: opcional(gtm),
      ativo: valor(form, "ativo") === "true",
    };
  }
  const { error } = await supabase.from("site_settings").upsert({ chave, valor: conteudo });
  falharSeErro(error);
  atualizarSite(TAGS.settings, TAGS.site);
}

export async function salvarAparencia(form: FormData) {
  await requireGerente();
  const tema = z.enum(["musgo", "grafite"]).parse(valor(form, "tema"));
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({
    chave: "aparencia", valor: { tema },
  });
  falharSeErro(error);
  atualizarSite(TAGS.settings, TAGS.site);
}

export async function alterarPapelEquipe(form: FormData) {
  const usuario = await requireGerente();
  if (usuario.papel !== "owner") throw new Error("Somente o owner pode alterar papéis da equipe.");
  const dados = z.object({
    id: uuid,
    papel: z.enum(["admin", "staff"]),
  }).parse({ id: valor(form, "id"), papel: valor(form, "papel") });
  const supabase = await createClient();
  const { error } = await supabase.rpc("alterar_papel_equipe", {
    usuario_alvo: dados.id, novo_papel: dados.papel,
  });
  falharSeErro(error);
  atualizarPainel("/admin/configuracoes");
}

export async function atualizarNomePerfil(form: FormData) {
  const usuario = await requireAuth();
  const nome = textoCurto.max(120).parse(valor(form, "nome"));
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ nome }).eq("id", usuario.id);
  falharSeErro(error);
  atualizarPainel("/admin");
}

export async function enviarMidia(form: FormData) {
  const usuario = await requireAuth();
  const arquivo = form.get("arquivo");
  const alt = valor(form, "alt");
  if (!(arquivo instanceof File) || arquivo.size === 0) throw new Error("Selecione um arquivo.");
  if (arquivo.size > 10 * 1024 * 1024) throw new Error("O arquivo deve ter no máximo 10 MB.");
  if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(arquivo.type)) {
    throw new Error("Formato não permitido. Envie JPG, PNG, WebP ou AVIF.");
  }
  const cabecalho = new Uint8Array(await arquivo.slice(0, 12).arrayBuffer());
  const assinaturaValida = arquivo.type === "image/jpeg"
    ? cabecalho[0] === 0xff && cabecalho[1] === 0xd8 && cabecalho[2] === 0xff
    : arquivo.type === "image/png"
      ? cabecalho.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10"
      : arquivo.type === "image/webp"
        ? String.fromCharCode(...cabecalho.slice(0, 4)) === "RIFF" &&
          String.fromCharCode(...cabecalho.slice(8, 12)) === "WEBP"
        : String.fromCharCode(...cabecalho.slice(4, 8)) === "ftyp" &&
          ["avif", "avis"].includes(String.fromCharCode(...cabecalho.slice(8, 12)));
  if (!assinaturaValida) throw new Error("O conteúdo do arquivo não corresponde a um formato de imagem permitido.");
  if (!alt || alt.length > 300) throw new Error("Informe um texto alternativo de até 300 caracteres.");
  const extensao = arquivo.type.split("/")[1].replace("jpeg", "jpg");
  const caminho = `${usuario.id}/${crypto.randomUUID()}.${extensao}`;
  const supabase = await createClient();
  const { error: erroUpload } = await supabase.storage.from("media").upload(caminho, arquivo, {
    contentType: arquivo.type, upsert: false,
  });
  falharSeErro(erroUpload);
  const { data } = supabase.storage.from("media").getPublicUrl(caminho);
  const { error } = await supabase.from("media").insert({
    caminho, url: data.publicUrl, tipo: arquivo.type, tamanho: arquivo.size,
    alt, criado_por: usuario.id,
  });
  if (error) {
    const { error: erroRemocao } = await supabase.storage.from("media").remove([caminho]);
    if (erroRemocao) console.error("[admin] Falha ao remover upload sem metadados.", erroRemocao);
    throw new Error(`Não foi possível registrar a mídia: ${error.message}`);
  }
  atualizarPainel("/admin/midia");
}

export async function excluirMidia(form: FormData) {
  await requireGerente();
  const id = uuid.parse(valor(form, "id"));
  const supabase = await createClient();
  const { data: item, error: erroBusca } = await supabase.from("media")
    .select("caminho,url").eq("id", id).single();
  falharSeErro(erroBusca);
  if (!item) throw new Error("Arquivo de mídia não encontrado.");
  const { data: projetos, error: erroProjetos } = await supabase.from("projects")
    .select("id,nome").eq("cover_url", item.url);
  falharSeErro(erroProjetos);
  const { data: galerias, error: erroGalerias } = await supabase.from("projects")
    .select("id,nome").contains("gallery", [item.url]);
  falharSeErro(erroGalerias);
  const usos = [...(projetos ?? []), ...(galerias ?? [])];
  if (usos.length) {
    throw new Error(`Não é possível excluir: a imagem está em uso por ${usos.map((projeto) => projeto.nome).join(", ")}.`);
  }
  const { error: erroRemocao } = await supabase.storage.from("media").remove([item.caminho]);
  falharSeErro(erroRemocao);
  const { error } = await supabase.from("media").delete().eq("id", id);
  falharSeErro(error);
  atualizarPainel("/admin/midia");
}

export async function atualizarAltMidia(form: FormData) {
  await requireAuth();
  const dados = z.object({
    id: uuid,
    alt: textoCurto.max(300),
  }).parse({ id: valor(form, "id"), alt: valor(form, "alt") });
  const supabase = await createClient();
  const { error } = await supabase.from("media").update({ alt: dados.alt }).eq("id", dados.id);
  falharSeErro(error);
  atualizarPainel("/admin/midia");
}
