import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variante = "primario" | "secundario" | "fantasma" | "claro";
type Tamanho = "sm" | "md" | "lg";

const VARIANTES: Record<Variante, string> = {
  primario:
    "bg-musgo text-off-white hover:bg-musgo-escuro active:bg-musgo-escuro shadow-suave hover:shadow-media",
  secundario:
    "border border-musgo/25 bg-transparent text-musgo hover:border-musgo/60 hover:bg-musgo/5",
  fantasma: "bg-transparent text-musgo hover:bg-musgo/8",
  claro:
    "bg-off-white text-musgo hover:bg-areia-claro shadow-suave hover:shadow-media",
};

const TAMANHOS: Record<Tamanho, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

const BASE = [
  "inline-flex items-center justify-center gap-2 rounded-marca font-medium",
  // max-w-full impede que um rotulo longo (um e-mail, por exemplo) empurre
  // a pagina para fora da tela no celular.
  "whitespace-nowrap select-none max-w-full",
  "transition-[background-color,border-color,color,box-shadow,transform]",
  "duration-[180ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
  "hover:-translate-y-px active:translate-y-0",
  "disabled:pointer-events-none disabled:opacity-50",
  "motion-reduce:transform-none motion-reduce:transition-none",
].join(" ");

type Comum = {
  children: ReactNode;
  variante?: Variante;
  tamanho?: Tamanho;
  className?: string;
};

type BotaoProps = Comum &
  Omit<ComponentProps<"button">, "className" | "children">;

/** Botao padrao do site. Para navegacao, use <BotaoLink />. */
export function Button({
  children,
  variante = "primario",
  tamanho = "md",
  className,
  type = "button",
  ...resto
}: BotaoProps) {
  return (
    <button
      type={type}
      className={cn(BASE, VARIANTES[variante], TAMANHOS[tamanho], className)}
      {...resto}
    >
      {children}
    </button>
  );
}

type BotaoLinkProps = Comum &
  Omit<ComponentProps<typeof Link>, "className" | "children">;

/** Mesma aparencia do Button, mas navega. Use para ancoras e links externos. */
export function BotaoLink({
  children,
  variante = "primario",
  tamanho = "md",
  className,
  ...resto
}: BotaoLinkProps) {
  return (
    <Link
      className={cn(BASE, VARIANTES[variante], TAMANHOS[tamanho], className)}
      {...resto}
    >
      {children}
    </Link>
  );
}
