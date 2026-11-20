import "server-only";

/**
 * Helpers de autorizacao para Server Actions e Route Handlers do painel.
 *
 * Nunca confie no cliente: toda mutacao do admin chama requireRole() antes
 * de tocar no banco, mesmo que o RLS ja bloqueie — defesa em profundidade,
 * e uma mensagem de erro melhor do que um erro de permissao do Postgres.
 */

import { redirect } from "next/navigation";

import { createClient } from "./server";

export type Papel = "owner" | "admin" | "staff";

export class ErroDeAutorizacao extends Error {
  constructor(message = "Voce nao tem permissao para fazer isso.") {
    super(message);
    this.name = "ErroDeAutorizacao";
  }
}

export type UsuarioAutenticado = {
  id: string;
  email: string | null;
  nome: string;
  papel: Papel;
};

/** Devolve o usuario logado e o seu papel, ou null se nao houver sessao. */
export async function getUsuarioAtual(): Promise<UsuarioAutenticado | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: erroSessao,
  } = await supabase.auth.getUser();

  if (erroSessao) throw new Error(`Falha ao validar sessão: ${erroSessao.message}`);
  if (!user) return null;

  const { data: perfil, error: erroPerfil } = await supabase
    .from("profiles")
    .select("nome, papel")
    .eq("id", user.id)
    .maybeSingle();

  if (erroPerfil) throw new Error(`Falha ao carregar perfil: ${erroPerfil.message}`);
  if (!perfil) return null;
  if (
    perfil.papel !== "owner" &&
    perfil.papel !== "admin" &&
    perfil.papel !== "staff"
  ) {
    throw new Error("O perfil não contém um papel de acesso válido.");
  }

  return {
    id: user.id,
    email: user.email ?? null,
    nome: typeof perfil.nome === "string" ? perfil.nome : "",
    papel: perfil.papel,
  };
}

/**
 * Exige que exista sessao e que o papel esteja entre os permitidos.
 *
 * SEM SESSAO: redireciona para o login. Sessao que expirou e fluxo normal de
 * uso, nao falha do sistema - mostrar tela de erro para isso so confunde.
 * O redirect funciona tanto na renderizacao da pagina quanto dentro de uma
 * Server Action, e o error.tsx nao o intercepta (o Next trata NEXT_REDIRECT
 * antes de chegar na fronteira de erro).
 *
 * PAPEL INSUFICIENTE: lanca ErroDeAutorizacao. Ai sim e um erro de verdade,
 * e a tela de erro do painel explica.
 */
export async function requireRole(
  papeisPermitidos: Papel[],
): Promise<UsuarioAutenticado> {
  const usuario = await getUsuarioAtual();

  if (!usuario) {
    redirect("/admin/login");
  }

  if (!papeisPermitidos.includes(usuario.papel)) {
    throw new ErroDeAutorizacao();
  }

  return usuario;
}

/** Atalho: qualquer usuario autenticado, papel nao importa. */
export async function requireAuth(): Promise<UsuarioAutenticado> {
  return requireRole(["owner", "admin", "staff"]);
}

/** Atalho: so quem pode gerenciar conteudo e dinheiro. */
export async function requireGerente(): Promise<UsuarioAutenticado> {
  return requireRole(["owner", "admin"]);
}
