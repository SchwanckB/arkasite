/**
 * Cliente Supabase para Server Components, Server Actions e Route Handlers.
 *
 * Usa a chave anonima + os cookies da sessao: respeita RLS normalmente,
 * como se fosse o proprio usuario logado fazendo a chamada. E este cliente
 * que toda leitura/escrita autenticada do painel deve usar.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { credenciaisPublicas } from "./env";

export async function createClient() {
  const { url, anonKey } = credenciaisPublicas();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesParaSetar) {
        try {
          for (const { name, value, options } of cookiesParaSetar) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Chamado de um Server Component (nao de uma Action/Route Handler):
          // nao e possivel escrever cookie aqui. O middleware ja cuida de
          // renovar a sessao a cada requisicao, entao e seguro ignorar.
        }
      },
    },
  });
}
