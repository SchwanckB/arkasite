/**
 * Rastreamento: Google Ads, Google Analytics 4 e Google Tag Manager.
 *
 * Nada e injetado quando nao ha id configurado - o site funciona igual sem
 * rastreamento nenhum. Isso mantem a promessa da fundacao: o site sobe sem
 * depender de configuracao externa.
 *
 * Os ids vem de getTracking(). Hoje de variaveis de ambiente; a Parte 7 passa
 * a ler de site_settings para o dono editar pelo painel sem novo deploy.
 *
 * LGPD: estes scripts usam cookies de publicidade. Se o site passar a receber
 * visitantes da Uniao Europeia, ou se voce quiser seguir a risca as boas
 * praticas de consentimento no Brasil, sera preciso um banner de consentimento
 * que so libere os scripts apos o aceite. Ver docs/PENDENCIAS.md.
 */

import Script from "next/script";

import { getTracking } from "@/lib/data";

export async function Rastreamento() {
  const t = await getTracking();

  if (!t.ativo) return null;

  // O gtag.js e carregado uma vez e serve tanto ao Google Ads quanto ao GA4.
  const idGtag = t.googleAdsId ?? t.googleAnalyticsId;
  const temAlgo = idGtag || t.gtmId;

  if (!temAlgo) return null;

  return (
    <>
      {idGtag ? (
        <>
          <Script
            id="gtag-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${idGtag}`}
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${t.googleAdsId ? `gtag('config', '${t.googleAdsId}');` : ""}
              ${t.googleAnalyticsId ? `gtag('config', '${t.googleAnalyticsId}');` : ""}
            `}
          </Script>
        </>
      ) : null}

      {t.gtmId ? (
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${t.gtmId}');
          `}
        </Script>
      ) : null}
    </>
  );
}
