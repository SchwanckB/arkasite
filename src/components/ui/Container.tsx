import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** "estreito" para blocos de texto longos; "largo" para grades. */
  largura?: "estreito" | "padrao" | "largo";
};

const LARGURAS = {
  estreito: "max-w-3xl",
  padrao: "max-w-6xl",
  largo: "max-w-[80rem]",
} as const;

/** Centraliza o conteudo e aplica o respiro lateral padrao do site. */
export function Container({
  children,
  className,
  as: Componente = "div",
  largura = "padrao",
}: ContainerProps) {
  return (
    <Componente
      className={cn("mx-auto w-full px-5 sm:px-8", LARGURAS[largura], className)}
    >
      {children}
    </Componente>
  );
}
