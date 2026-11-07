"use client";

/**
 * Disparo de conversoes do Google Ads.
 *
 * Use quando algo de valor comercial acontecer: envio do formulario de
 * contato, clique no WhatsApp, clique no e-mail. Se o rastreamento nao
 * estiver configurado, a funcao simplesmente nao faz nada - nunca quebra.
 *
 * O rotulo de conversao vem de NEXT_PUBLIC_GOOGLE_ADS_CONVERSAO, no formato
 * "AW-XXXXXXXXXX/abcDEFghiJKL" (o Google Ads mostra esse valor na tela de
 * criacao da acao de conversao).
 */

type Gtag = (
  comando: "event" | "config" | "js",
  alvo: string | Date,
  parametros?: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    dataLayer?: unknown[];
  }
}

/** Nomes de evento usados no site. Mantenha a lista curta e estavel. */
export type EventoConversao =
  | "contato_formulario"
  | "contato_whatsapp"
  | "contato_email";

/**
 * Registra uma conversao no Google Ads e um evento no dataLayer.
 *
 * Seguro de chamar em qualquer lugar: se o gtag nao carregou (sem id
 * configurado, bloqueador de anuncios, rastreamento desligado), sai calado.
 */
export function registrarConversao(
  evento: EventoConversao,
  parametros?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;

  const rotulo = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSAO?.trim();

  try {
    // Evento nomeado: aparece no GA4 e fica disponivel no Tag Manager.
    window.gtag?.("event", evento, parametros);

    // Conversao do Google Ads: precisa do rotulo "AW-XXXX/LABEL".
    if (rotulo) {
      window.gtag?.("event", "conversion", { send_to: rotulo, ...parametros });
    }

    // Tambem no dataLayer, para quem preferir configurar pelo Tag Manager.
    window.dataLayer?.push({ event: evento, ...parametros });
  } catch {
    // Rastreamento nunca pode derrubar uma interacao do usuario.
  }
}
