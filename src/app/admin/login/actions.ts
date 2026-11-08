"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { supabaseConfigurado } from "@/lib/supabase/env";

export type LoginState = { erro: string };

const esquemaLogin = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe sua senha."),
  proximo: z.string().optional(),
});

export async function entrar(
  _estado: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const dados = esquemaLogin.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
    proximo: formData.get("proximo"),
  });

  if (!dados.success) {
    return { erro: dados.error.issues[0]?.message ?? "Confira os dados." };
  }

  if (!supabaseConfigurado()) {
    return { erro: "O painel ainda não está conectado ao Supabase." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: dados.data.email,
    password: dados.data.senha,
  });

  if (error) {
    return { erro: "E-mail ou senha inválidos. Confira os dados e tente novamente." };
  }

  const { data: usuario, error: erroUsuario } = await supabase.auth.getUser();
  if (erroUsuario) throw new Error(`Falha ao validar a conta: ${erroUsuario.message}`);
  if (!usuario.user) {
    return { erro: "Não foi possível validar sua conta. Tente entrar novamente." };
  }

  const { data: perfil, error: erroPerfil } = await supabase
    .from("profiles")
    .select("id, papel")
    .eq("id", usuario.user.id)
    .maybeSingle();

  if (erroPerfil) {
    console.error("[admin] Falha ao consultar o perfil após login.", erroPerfil);
    const { error: erroSaida } = await supabase.auth.signOut();
    if (erroSaida) {
      throw new Error(`Falha ao encerrar sessão sem perfil: ${erroSaida.message}`);
    }
    return {
      erro: "Não foi possível validar seu perfil. Confira se as migrações do Supabase foram aplicadas.",
    };
  }

  if (!perfil) {
    const { error: erroSaida } = await supabase.auth.signOut();
    if (erroSaida) throw new Error(`Falha ao encerrar sessão sem perfil: ${erroSaida.message}`);
    return {
      erro: "Esta conta ainda não tem um perfil de painel. Peça ao owner para conferir o cadastro no Supabase.",
    };
  }
  if (
    perfil.papel !== "owner" &&
    perfil.papel !== "admin" &&
    perfil.papel !== "staff"
  ) {
    const { error: erroSaida } = await supabase.auth.signOut();
    if (erroSaida) throw new Error(`Falha ao encerrar sessão com papel inválido: ${erroSaida.message}`);
    return { erro: "O perfil desta conta não tem um papel de acesso válido." };
  }

  const destino = dados.data.proximo;
  if (destino?.startsWith("/admin/") && !destino.startsWith("/admin/login")) {
    redirect(destino);
  }

  redirect("/admin");
}
