"use client";

import { icons } from "lucide-react";

import { cn } from "@/lib/utils";

type IconeProps = {
  /** Nome do icone em PascalCase, como vem do conteudo (ex.: "Monitor"). */
  nome: string;
  tamanho?: number;
  className?: string;
};

/**
 * Renderiza um icone lucide pelo nome.
 *
 * O conteudo guarda icones como string para que o painel (Parte 8) possa
 * trocar o icone sem alterar codigo. Se o nome nao existir, nao quebra:
 * cai num icone neutro.
 *
 * ATENCAO ao escolher nomes: nem todo export do lucide-react esta no mapa
 * `icones`. Apelidos antigos (Code2, por exemplo) existem como export solto
 * mas nao como chave, e cairiam silenciosamente no icone neutro. Use
 * `existeIcone()` ou o aviso de desenvolvimento abaixo para conferir.
 */
export function Icone({ nome, tamanho = 24, className }: IconeProps) {
  const Componente = icons[nome as keyof typeof icons];

  if (!Componente) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[ARKA] Icone "${nome}" nao existe no lucide-react. ` +
          `Usando o icone neutro. Confira o nome em https://lucide.dev/icons.`,
      );
    }

    return (
      <icons.Circle
        size={tamanho}
        strokeWidth={1.5}
        aria-hidden
        className={cn("shrink-0", className)}
      />
    );
  }

  return (
    <Componente
      size={tamanho}
      strokeWidth={1.5}
      aria-hidden
      className={cn("shrink-0", className)}
    />
  );
}

/**
 * Diz se um nome de icone e valido.
 * Util no painel (Parte 8) para validar a escolha antes de salvar.
 */
export function existeIcone(nome: string): boolean {
  return nome in icons;
}
