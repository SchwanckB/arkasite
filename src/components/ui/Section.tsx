import type { ReactNode } from "react";

import { Container } from "./Container";
import { cn } from "@/lib/utils";

type SectionProps = {
  children: ReactNode;
  /** Ancora usada pelo menu (ex.: "servicos" vira href="#servicos"). */
  id?: string;
  className?: string;
  /** Fundo da secao. Alterne entre secoes para criar ritmo. */
  fundo?: "claro" | "alternado" | "escuro" | "musgo";
  /** Espacamento vertical. */
  espaco?: "normal" | "compacto" | "amplo";
  largura?: "estreito" | "padrao" | "largo";
  /** Desliga o Container interno quando a secao precisa ocupar a tela toda. */
  semContainer?: boolean;
};

const FUNDOS = {
  claro: "bg-fundo text-texto",
  alternado: "bg-fundo-alt text-texto",
  escuro: "bg-fundo-escuro text-texto-invertido",
  musgo: "bg-musgo text-texto-invertido",
} as const;

const ESPACOS = {
  compacto: "py-14 sm:py-16",
  normal: "py-20 sm:py-28",
  amplo: "py-24 sm:py-36",
} as const;

/** Envolucro padrao de uma secao do site: fundo, espacamento e ancora. */
export function Section({
  children,
  id,
  className,
  fundo = "claro",
  espaco = "normal",
  largura = "padrao",
  semContainer = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-24",
        FUNDOS[fundo],
        ESPACOS[espaco],
        className,
      )}
    >
      {semContainer ? children : <Container largura={largura}>{children}</Container>}
    </section>
  );
}
