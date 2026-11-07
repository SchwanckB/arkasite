import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type CardProps = {
  children: ReactNode;
  className?: string;
  /** Liga a elevacao no hover. Use em cartoes clicaveis. */
  interativo?: boolean;
  fundo?: "superficie" | "transparente" | "areia";
};

const FUNDOS = {
  superficie: "bg-superficie border-borda",
  transparente: "bg-transparent border-borda",
  areia: "bg-areia-claro border-borda-forte",
} as const;

/** Cartao base: borda discreta, cantos da marca, elevacao opcional. */
export function Card({
  children,
  className,
  interativo = false,
  fundo = "superficie",
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-marca-lg border p-6",
        FUNDOS[fundo],
        interativo && [
          "transition-[box-shadow,transform,border-color]",
          "duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          "hover:-translate-y-1 hover:border-salvia/40 hover:shadow-media",
          "motion-reduce:transform-none motion-reduce:transition-none",
        ],
        className,
      )}
    >
      {children}
    </div>
  );
}
