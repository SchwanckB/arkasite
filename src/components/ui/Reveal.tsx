"use client";

/**
 * <Reveal /> e <RevealItem /> - entrada animada de qualquer bloco ao entrar na tela.
 *
 * E o jeito padrao de animar o site. Use em vez de escrever motion.div solto,
 * para que todas as secoes compartilhem a mesma curva e duracao (definidas
 * em src/lib/motion.ts).
 *
 * Respeita prefers-reduced-motion automaticamente: com movimento reduzido o
 * conteudo aparece sem deslocamento, nunca fica invisivel.
 *
 * IMPORTANTE: sao DOIS exports nomeados, de proposito. Nao transforme em
 * componente composto (Reveal.Item): propriedades estaticas nao atravessam a
 * fronteira server/client do React, e as secoes do site sao Server Components.
 *
 * Exemplos:
 *   <Reveal>texto</Reveal>                      // fade-up padrao
 *   <Reveal variante="mascara">...</Reveal>     // revelacao por mascara
 *   <Reveal delay={0.1}>...</Reveal>            // com atraso
 *
 *   <Reveal comoLista>                          // anima os filhos em sequencia
 *     <RevealItem>um</RevealItem>
 *     <RevealItem>dois</RevealItem>
 *   </Reveal>
 */

import { motion } from "motion/react";
import type { ReactNode } from "react";

import {
  atraso as tokensAtraso,
  emVista,
  useStagger,
  useVariante,
  type NomeVariante,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Tags que podem ser animadas.
 *
 * O mapa e montado uma unica vez, no carregamento do modulo. Gerar o
 * componente dentro do render (motion.create(tag)) criaria um tipo novo a
 * cada passagem e remontaria os filhos, perdendo o estado deles.
 *
 * Precisa de uma tag que nao esta aqui? Acrescente nesta lista.
 */
const COMPONENTES = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  figure: motion.figure,
  ul: motion.ul,
  li: motion.li,
  span: motion.span,
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
} as const;

export type TagAnimavel = keyof typeof COMPONENTES;

type RevealProps = {
  children: ReactNode;
  /** Qual variante de movimento usar. Padrao: fadeUp. */
  variante?: NomeVariante;
  /** Atraso em segundos antes de iniciar. */
  delay?: number;
  /** Tag HTML renderizada. Padrao: div. */
  as?: TagAnimavel;
  className?: string;
  /**
   * Anima os filhos diretos em sequencia. Cada filho precisa ser um
   * <RevealItem /> para participar do encadeamento.
   */
  comoLista?: boolean;
  /** Intervalo entre os filhos quando comoLista esta ativo. */
  intervalo?: number;
};

export function Reveal({
  children,
  variante = "fadeUp",
  delay = 0,
  as = "div",
  className,
  comoLista = false,
  intervalo = tokensAtraso.curto,
}: RevealProps) {
  const Componente = COMPONENTES[as];
  const variantesItem = useVariante(variante);
  const variantesLista = useStagger(intervalo, delay);

  // A variante "mascara" precisa de overflow hidden no container.
  const precisaRecorte = variante === "mascara";

  return (
    <Componente
      className={cn(precisaRecorte && "overflow-hidden", className)}
      initial="oculto"
      whileInView="visivel"
      viewport={emVista}
      variants={comoLista ? variantesLista : variantesItem}
      transition={comoLista ? undefined : { delay }}
    >
      {children}
    </Componente>
  );
}

type RevealItemProps = {
  children: ReactNode;
  variante?: NomeVariante;
  as?: TagAnimavel;
  className?: string;
};

/** Filho de um <Reveal comoLista>. Herda o encadeamento do pai. */
export function RevealItem({
  children,
  variante = "fadeUp",
  as = "div",
  className,
}: RevealItemProps) {
  const Componente = COMPONENTES[as];
  const variantes = useVariante(variante);

  return (
    <Componente className={className} variants={variantes}>
      {children}
    </Componente>
  );
}
