"use client";

/**
 * Brilho radial discreto no hero. Evita o bloco geométrico que parecia uma
 * mancha cinza cortada no canto da tela.
 */

import { motion, useScroll, useTransform } from "motion/react";

import { useReducedMotion } from "@/lib/motion";

export function HeroBackdrop() {
  const reduzido = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, reduzido ? 0 : 28]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -right-56 -top-64 h-[34rem] w-[34rem] rounded-full opacity-70 sm:-right-48 sm:-top-72 sm:h-[42rem] sm:w-[42rem]"
      style={{
        y,
        background:
          "radial-gradient(circle, rgb(125 139 121 / 0.13) 0%, rgb(125 139 121 / 0.055) 38%, transparent 70%)",
      }}
    />
  );
}
