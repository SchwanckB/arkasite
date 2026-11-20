import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * <LinhaCota /> - linha de cota, do vocabulario de desenho tecnico.
 *
 * E o unico dispositivo grafico proprio desta pagina, e aparece em dois
 * lugares: as tres provas do hero e as quatro etapas do processo. Em mais
 * nenhum - se voce esta pensando em usar num terceiro, provavelmente a
 * secao precisa de outra coisa.
 *
 * Por que uma cota e nao uma lista de ícones: a cota mede. Ela afirma que os
 * itens sao equivalentes e que juntos formam um todo fechado, com inicio e
 * fim marcados. Uma fileira de ícones com check nao diz nada disso - e
 * decoracao. Isto vem da propria identidade: o brand board constroi o
 * simbolo sobre grade e compasso, e lista "traçado de circuito" e "grade de
 * pontos" como padroes de apoio.
 *
 *   ├──────────┼──────────┼──────────┤
 *   rápido     responsivo  você edita
 *
 * Em telas estreitas a cota vira vertical, porque tres colunas de texto em
 * 375px nao cabem sem quebrar palavra.
 */

type ItemCota = {
  /** Chave estavel. */
  id: string;
  /** Texto curto. Uma a tres palavras - a cota nao comporta frase. */
  rotulo: ReactNode;
};

type LinhaCotaProps = {
  itens: ItemCota[];
  className?: string;
  /** Rotulo acessivel do grupo, quando a cota nao estiver sob um titulo. */
  "aria-label"?: string;
};

export function LinhaCota({
  itens,
  className,
  "aria-label": ariaLabel,
}: LinhaCotaProps) {
  if (itens.length === 0) return null;

  return (
    <ul
      aria-label={ariaLabel}
      className={cn(
        // Vertical no celular, cota de verdade a partir de sm.
        "flex flex-col gap-3 sm:flex-row sm:gap-0",
        className,
      )}
    >
      {itens.map((item, indice) => (
        <li
          key={item.id}
          className={cn(
            "relative flex-1 text-sm font-medium text-grafite",
            // A regua: borda superior em areia, com o tick inicial em musgo.
            "sm:border-t sm:border-areia sm:pr-6 sm:pt-3",
            // Tick de inicio, em todos os itens.
            "sm:before:absolute sm:before:left-0 sm:before:top-0 sm:before:h-2 sm:before:w-px sm:before:bg-musgo",
            // Tick de fim, so no ultimo: fecha a cota.
            indice === itens.length - 1 &&
              "sm:pr-0 sm:after:absolute sm:after:right-0 sm:after:top-0 sm:after:h-2 sm:after:w-px sm:after:bg-musgo",
            // No celular cada item ganha um tick a esquerda, na vertical.
            "border-l border-areia pl-3 sm:border-l-0 sm:pl-0",
          )}
        >
          {item.rotulo}
        </li>
      ))}
    </ul>
  );
}
