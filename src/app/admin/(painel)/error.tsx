"use client";

/**
 * Tela de erro do painel.
 *
 * Antes disto nao existia nenhum error.tsx no projeto: as paginas do painel
 * usam `throw new Error(...)` em cada consulta e as actions validam com
 * `z.parse()`, que lanca. Qualquer instabilidade do Supabase ou um campo fora
 * do formato derrubava para a tela crua do Next, em ingles e fora da marca.
 *
 * O erro fica contido no <main> do AdminShell: a lateral, o cabecalho e a
 * barra de atalhos continuam funcionando, entao da para navegar para outro
 * modulo sem recarregar a pagina.
 */

import { useEffect } from "react";
import Link from "next/link";

import { Icone } from "@/components/ui/Icone";

export default function ErroPainel({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] Erro nao tratado na tela do painel.", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="mx-auto max-w-xl rounded-marca-lg border border-borda bg-superficie p-6 shadow-suave sm:p-8"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-marca bg-erro-suave text-erro">
        <Icone nome="TriangleAlert" tamanho={22} />
      </span>

      <h1 className="mt-5 font-display text-xl text-grafite sm:text-titulo-sm">
        Esta tela não carregou
      </h1>

      <p className="mt-2 leading-relaxed text-texto-suave">
        Nada foi perdido: o erro aconteceu ao montar a tela, não ao salvar.
        Na maioria das vezes é uma instabilidade momentânea da conexão com o
        banco e tentar de novo resolve.
      </p>

      {/*
        A mensagem crua ajuda a diagnosticar sem precisar abrir o console.
        O digest e o identificador que aparece no log do servidor.
      */}
      <details className="mt-5 rounded-marca border border-borda bg-fundo-alt px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-grafite">
          Detalhes técnicos
        </summary>
        <p className="mt-2 break-words font-mono text-xs leading-relaxed text-texto-suave">
          {error.message || "Erro sem mensagem."}
          {error.digest ? ` · digest ${error.digest}` : ""}
        </p>
      </details>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-marca bg-musgo px-5 text-sm font-medium text-off-white transition-colors hover:bg-musgo-escuro"
        >
          <Icone nome="RotateCcw" tamanho={16} />
          Tentar de novo
        </button>
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center justify-center rounded-marca border border-borda px-5 text-sm font-medium text-grafite transition-colors hover:bg-areia-claro"
        >
          Voltar à visão geral
        </Link>
      </div>

      <p className="mt-5 border-t border-borda pt-4 text-xs leading-relaxed text-texto-suave">
        Se o erro se repetir, confira em Configurações se as migrações do
        Supabase estão aplicadas e se a sessão ainda está ativa.
      </p>
    </div>
  );
}
