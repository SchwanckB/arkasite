/**
 * Middleware - protege /admin/* e mantem a sessao do Supabase viva.
 *
 * Regras:
 *   1. Supabase nao configurado  -> deixa passar. app/admin/layout.tsx
 *      mostra a tela de configuracao (nunca um erro generico).
 *   2. /admin/login              -> sempre passa (senao ninguem entra).
 *   3. /admin/* sem sessao       -> redireciona para /admin/login.
 *   4. Toda resposta             -> renova os cookies de sessao, para a
 *      sessao nao expirar silenciosamente no meio do uso.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { supabaseConfigurado } from "@/lib/supabase/env";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (!supabaseConfigurado()) {
    // app/admin/layout.tsx mostra a tela de configuracao. Nao ha sessao
    // para verificar, entao nao ha nada a fazer aqui alem de deixar passar.
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesParaSetar) {
          for (const { name, value } of cookiesParaSetar) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesParaSetar) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() (nao getSession()) valida o token contra o servidor do
  // Supabase em vez de confiar cegamente no cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ehLogin = request.nextUrl.pathname.startsWith("/admin/login");

  if (!user && !ehLogin) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/admin/login";
    destino.searchParams.set("proximo", request.nextUrl.pathname);
    return NextResponse.redirect(destino);
  }

  if (user && ehLogin) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/admin";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
