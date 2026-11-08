import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Entrar no painel",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string | string[] }>;
}) {
  const parametros = await searchParams;
  const proximo = Array.isArray(parametros.proximo)
    ? parametros.proximo[0]
    : parametros.proximo;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-5 py-12">
      <section className="w-full rounded-marca-lg border border-borda bg-superficie p-6 shadow-suave sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-salvia">
          ARKA Technologies
        </p>
        <h1 className="mt-3 font-display text-2xl text-grafite">
          Entrar no painel
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-texto-suave">
          Acesse com o e-mail e a senha cadastrados no projeto Supabase.
        </p>
        <LoginForm proximo={proximo} />
        <Link
          href="/"
          className="mt-5 inline-flex text-sm font-medium text-musgo hover:text-musgo-escuro"
        >
          Voltar ao site
        </Link>
      </section>
    </main>
  );
}
