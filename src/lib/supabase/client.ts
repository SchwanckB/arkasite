"use client";

/**
 * Cliente Supabase para Client Components.
 *
 * Use dentro de componentes marcados "use client" quando precisar de dados
 * em tempo real ou de uma mutacao disparada diretamente do navegador.
 * Prefira Server Actions/Route Handlers sempre que possivel: eles validam
 * sessao e papel no servidor, que e onde a seguranca de verdade acontece.
 */

import { createBrowserClient } from "@supabase/ssr";

import { credenciaisPublicas } from "./env";

export function createClient() {
  const { url, anonKey } = credenciaisPublicas();
  return createBrowserClient(url, anonKey);
}
