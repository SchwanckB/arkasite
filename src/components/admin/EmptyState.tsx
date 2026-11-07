import type { ReactNode } from "react";

import { Icone } from "@/components/ui/Icone";

type EmptyStateProps = {
  icone?: string;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
};

/**
 * Estado vazio amigável. Toda rota do painel que ainda não tem dado usa
 * isto em vez de uma tela em branco - inclusive as rotas-esqueleto desta
 * parte, antes dos módulos 8/9/10 ligarem a funcionalidade real.
 */
export function EmptyState({
  icone = "Inbox",
  titulo,
  descricao,
  acao,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-marca-lg border border-dashed border-borda-forte bg-areia-claro/40 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-superficie text-salvia">
        <Icone nome={icone} tamanho={22} />
      </span>
      <h3 className="mt-4 font-display text-base text-grafite">{titulo}</h3>
      {descricao ? (
        <p className="mt-1.5 max-w-sm text-sm text-texto-suave">{descricao}</p>
      ) : null}
      {acao ? <div className="mt-5">{acao}</div> : null}
    </div>
  );
}
