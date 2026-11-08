import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import type { ReactNode } from "react";

import { supabaseConfigurado } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Painel administrativo | ARKA Technologies",
  robots: { index: false, follow: false },
};

export const instant = false;

function ConfiguracaoPendente() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-5 py-12">
      <section className="w-full rounded-marca-lg border border-borda bg-superficie p-6 shadow-suave sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-salvia">
          ARKA Technologies
        </p>
        <h1 className="mt-3 font-display text-2xl text-grafite sm:text-3xl">
          Falta conectar o painel ao banco
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-texto-suave">
          O site público continua funcionando. Para entrar no admin, crie um
          projeto Supabase, rode a migração e o seed e configure as variáveis de
          ambiente do servidor.
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-texto-suave">
          <li>Copie .env.example para .env.local.</li>
          <li>
            Preencha NEXT_PUBLIC_SUPABASE_URL com a Project URL e
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY com a chave pública.
          </li>
          <li>
            Rode supabase/migrations/0001_init.sql e supabase/seed.sql no SQL
            Editor do Supabase.
          </li>
          <li>Crie o primeiro usuário em Authentication → Users.</li>
        </ol>
        <p className="mt-6 rounded-marca bg-areia-claro px-4 py-3 text-sm text-grafite">
          O primeiro usuário do projeto vira owner. Não existe cadastro público
          no painel.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-marca bg-musgo px-5 text-sm font-medium text-off-white transition-colors hover:bg-musgo-escuro"
        >
          Voltar ao site
        </Link>
      </section>
    </main>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  if (!supabaseConfigurado()) return <ConfiguracaoPendente />;
  return children;
}
