"use client";

/**
 * Linha de conexao entre as 4 etapas do processo - PARTE 2.
 *
 * No desktop (lg+) as etapas ficam em linha e a conexao e uma unica linha
 * horizontal atras dos badges numerados. No mobile as etapas ficam
 * empilhadas e a conexao e um segmento vertical entre cada par de etapas,
 * em fluxo normal (sem posicionamento absoluto), para acompanhar a altura
 * real de cada etapa sem medir nada em JS.
 *
 * A variante vertical usa `linha`, pronta em @/lib/motion. A horizontal nao
 * existe la (so anima scaleY), entao e montada aqui com os MESMOS tokens de
 * curva e duracao (`easing.marca`, `duracao.secao`) - nenhum valor novo.
 *
 * Com prefers-reduced-motion, as duas aparecem prontas (sem variants nem
 * animate), nunca deslocando layout: so transform e usado, nunca o fluxo.
 */

import { motion, type Variants } from "motion/react";

import { duracao, easing, emVista, linha, useReducedMotion } from "@/lib/motion";

/** Espelha a variante `linha`, mas no eixo X - para o traco horizontal do desktop. */
const linhaHorizontal: Variants = {
  oculto: { scaleX: 0, transformOrigin: "left" },
  visivel: {
    scaleX: 1,
    transformOrigin: "left",
    transition: { duration: duracao.secao, ease: easing.marca },
  },
};

/**
 * Traco unico, horizontal, atras das 4 etapas (desktop).
 * Os badges numerados tem 40px de altura e sao o primeiro elemento de cada
 * etapa: o centro deles fica a 20px (top-5) do topo da grade, e a linha usa
 * a mesma distancia para ficar alinhada. Vai de 12,5% a 87,5% da largura -
 * o centro da 1a e da 4a coluna em uma grade de 4 colunas iguais.
 */
export function LinhaConexaoHorizontal() {
  const reduzido = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-5 hidden h-px bg-borda-forte lg:block"
      initial={reduzido ? false : "oculto"}
      whileInView={reduzido ? undefined : "visivel"}
      viewport={emVista}
      variants={reduzido ? undefined : linhaHorizontal}
    />
  );
}

/**
 * Segmento vertical entre duas etapas (mobile/tablet). Um segmento por
 * intervalo - fica em fluxo normal entre os cartoes, alinhado ao centro do
 * badge (ml-5 = 20px, metade do h-10).
 */
export function LinhaConexaoVertical() {
  const reduzido = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      className="ml-5 h-8 w-px bg-borda-forte"
      initial={reduzido ? false : "oculto"}
      whileInView={reduzido ? undefined : "visivel"}
      viewport={emVista}
      variants={reduzido ? undefined : linha}
    />
  );
}
