import type { ReactNode } from "react";

import { Icone } from "@/components/ui/Icone";

type EstadoVazioProps = {
  icone?: string;
  /** O que esta vazio. Uma frase curta, sem ponto final. */
  titulo: string;
  /** Para que serve esta lista e qual e o proximo passo. */
  descricao: string;
  /** Botao ou link da acao principal, quando houver uma obvia. */
  acao?: ReactNode;
};

/**
 * Estado vazio do painel.
 *
 * Antes cada lista vazia mostrava uma frase seca - "Nenhum lançamento
 * registrado." - que diz o que falta mas nao o que fazer. Para quem esta
 * abrindo o modulo pela primeira vez, essa e justamente a tela que precisa
 * ensinar o proximo passo.
 */
export function EstadoVazio({
  icone = "Inbox",
  titulo,
  descricao,
  acao,
}: EstadoVazioProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-marca-lg border border-dashed border-borda-forte bg-superficie px-6 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-marca bg-areia-claro text-musgo">
        <Icone nome={icone} tamanho={22} />
      </span>
      <h3 className="font-display text-base text-grafite">{titulo}</h3>
      <p className="max-w-sm text-pretty text-sm leading-relaxed text-texto-suave">
        {descricao}
      </p>
      {acao ? <div className="mt-1">{acao}</div> : null}
    </div>
  );
}
