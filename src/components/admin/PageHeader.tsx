import type { ReactNode } from "react";

type PageHeaderProps = {
  titulo: string;
  descricao?: string;
  /** Botões de ação (ex.: "Novo lançamento"), alinhados à direita no desktop. */
  acoes?: ReactNode;
};

/** Cabeçalho padrão de uma página do painel: título, descrição e ações. */
export function PageHeader({ titulo, descricao, acoes }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-xl text-grafite sm:text-2xl">
          {titulo}
        </h1>
        {descricao ? (
          <p className="mt-1 text-sm text-texto-suave">{descricao}</p>
        ) : null}
      </div>

      {acoes ? (
        <div className="flex flex-wrap items-center gap-2">{acoes}</div>
      ) : null}
    </div>
  );
}
