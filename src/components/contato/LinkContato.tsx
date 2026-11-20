"use client";

/**
 * <LinkContato /> - qualquer link que leve a uma conversa com a ARKA.
 *
 * Existe por um motivo so: garantir que TODO caminho de contato registre a
 * conversao. Antes, lib/conversoes.ts instrumentava tres eventos e apenas um
 * ponto do site chamava registrarConversao - os botoes do hero, da faixa
 * verde, dos cartoes de servico e da secao de contato nao disparavam nada,
 * entao o Google Ads nao tinha como otimizar a verba.
 *
 * O `origem` vira o parametro `placement` do evento: da para ver no GA4 de
 * qual bloco da pagina veio cada conversa.
 */

import type { ReactNode } from "react";

import { registrarConversao, type EventoConversao } from "@/lib/conversoes";

type LinkContatoProps = {
  href: string;
  evento: EventoConversao;
  /** De qual bloco da pagina partiu o clique (ex.: "hero", "cartao_servico"). */
  origem: string;
  /** Rotulo de conversao do Google Ads, vindo de getTracking(). */
  conversao?: string | null;
  /** Dados extras do evento (ex.: qual servico). */
  detalhes?: Record<string, unknown>;
  className?: string;
  children: ReactNode;
  /** Links externos abrem em nova aba; ancoras internas, nao. */
  externo?: boolean;
  "aria-label"?: string;
};

export function LinkContato({
  href,
  evento,
  origem,
  conversao,
  detalhes,
  className,
  children,
  externo = true,
  "aria-label": ariaLabel,
}: LinkContatoProps) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target={externo ? "_blank" : undefined}
      rel={externo ? "noopener noreferrer" : undefined}
      onClick={() =>
        registrarConversao(evento, { placement: origem, ...detalhes }, conversao)
      }
      className={className}
    >
      {children}
      {externo ? <span className="sr-only"> (abre em nova aba)</span> : null}
    </a>
  );
}
