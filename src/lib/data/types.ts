/**
 * ARKA - contratos de dados.
 *
 * Estes tipos sao o contrato entre o conteudo estatico (src/content/*),
 * a camada de dados (src/lib/data) e as secoes do site. A Parte 7 vai
 * reimplementar a camada de dados com Supabase MANTENDO estes mesmos tipos.
 *
 * Proprietario: Parte 0. Alterar um tipo aqui quebra outras partes:
 * so faca isso com acordo explicito e registre em docs/ARCHITECTURE.md.
 */

/* ------------------------------------------------------------------ */
/* Configuracoes do site                                               */
/* ------------------------------------------------------------------ */

export type SiteSettings = {
  nome: string;
  tagline: string;
  descricao: string;
  url: string;
  contato: {
    email: string;
    whatsapp: string;
    /** Numero so com digitos, formato internacional, para links wa.me. */
    whatsappDigitos: string;
    telefone?: string;
    cidade?: string;
  };
  redes: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
  };
  seo: {
    titulo: string;
    descricao: string;
    imagemOg: string;
  };
  /** Mensagem pre-preenchida no link do WhatsApp. */
  mensagemWhatsapp: string;
};

/* ------------------------------------------------------------------ */
/* Secoes do site                                                      */
/* ------------------------------------------------------------------ */

export type SectionId =
  | "hero"
  | "sobre"
  | "diferenciais"
  | "servicos"
  | "processo"
  | "portfolio"
  | "cta"
  | "contato";

export type Section = {
  id: SectionId;
  /** Titulo curto usado no menu e no painel. */
  rotulo: string;
  titulo: string;
  subtitulo?: string;
  descricao?: string;
  visivel: boolean;
  ordem: number;
  /** Campos livres por secao (ex.: textos do hero, rotulos de botao). */
  conteudo?: Record<string, unknown>;
};

/* ------------------------------------------------------------------ */
/* Blocos de conteudo                                                  */
/* ------------------------------------------------------------------ */

/** Nome de um icone da biblioteca lucide-react, em PascalCase. */
export type NomeIcone = string;

export type Service = {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  /** Lista curta do que o cliente recebe. */
  entregas: string[];
  icone: NomeIcone;
  ordem: number;
  publicado: boolean;
};

export type Differential = {
  id: string;
  titulo: string;
  descricao: string;
  icone: NomeIcone;
  ordem: number;
};

export type ProcessStep = {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
  /** O que acontece nesta etapa, na pratica. */
  detalhe?: string;
  icone: NomeIcone;
};

/* ------------------------------------------------------------------ */
/* Portfolio                                                           */
/* ------------------------------------------------------------------ */

export type DispositivoProjeto = "desktop" | "tablet" | "mobile";

/** Variante visual do mockup gerado quando o projeto nao tem imagem de capa. */
export type VarianteProjeto = "institucional" | "loja" | "landing" | "servico";

export type Project = {
  id: string;
  slug: string;
  nome: string;
  categoria: string;
  descricao: string;
  dispositivo: DispositivoProjeto;
  variante: VarianteProjeto;
  /** true = projeto conceito, criado para demonstrar capacidade. */
  isConcept: boolean;
  liveUrl?: string;
  /** Imagem de capa. Quando ausente, a secao usa o <MockSite />. */
  coverUrl?: string;
  gallery?: string[];
  /** Texto alternativo da capa. Obrigatorio quando ha coverUrl. */
  coverAlt?: string;
  tags: string[];
  publicado: boolean;
  ordem: number;
};

/* ------------------------------------------------------------------ */
/* Leads                                                               */
/* ------------------------------------------------------------------ */

export type LeadInput = {
  nome: string;
  email: string;
  empresa?: string;
  telefone?: string;
  tipoProjeto?: string;
  mensagem: string;
  /** De onde veio o lead. O formulario do site envia "site". */
  origem?: string;
};

export type LeadFalha =
  | "not_configured"
  | "invalid"
  | "rate_limited"
  | "error";

/**
 * Resultado de createLead. Nunca lanca excecao: o formulario precisa
 * conseguir mostrar uma mensagem honesta em qualquer cenario.
 */
export type LeadResult =
  | { ok: true; id?: string }
  | { ok: false; reason: LeadFalha; mensagem?: string };
