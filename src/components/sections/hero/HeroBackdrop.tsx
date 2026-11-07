"use client";

/**
 * HeroBackdrop - padrao visual de apoio do hero (PARTE 1).
 *
 * E o "bloco musgo solido" descrito em docs/BRAND.md (padroes visuais):
 * uma forma geometrica, de cor cheia, opacidade baixa, atras do conteudo.
 * Puramente decorativo (aria-hidden) e sem interferir no layout - so
 * transform, nunca largura/altura, para nao causar deslocamento.
 *
 * Tem um parallax bem sutil ligado ao scroll. Com prefers-reduced-motion a
 * forma fica parada (ver useReducedMotion em @/lib/motion).
 */

import { motion, useScroll, useTransform } from "motion/react";

import { useReducedMotion } from "@/lib/motion";

export function HeroBackdrop() {
  const reduzido = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, reduzido ? 0 : 56]);

  return (
    <motion.div
      aria-hidden
      style={{ y }}
      className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-marca-lg bg-musgo opacity-[0.07] sm:-right-24 sm:-top-24 sm:h-[26rem] sm:w-[26rem]"
    />
  );
}
