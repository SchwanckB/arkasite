import type { SiteSettings } from "@/lib/data/types";

type StructuredDataProps = {
  settings: SiteSettings;
};

export function StructuredData({ settings }: StructuredDataProps) {
  const siteUrl = new URL("/", settings.url).toString();
  const logoUrl = new URL("/brand/logo-horizontal-transparente.png", settings.url).toString();
  const sameAs = Object.values(settings.redes).filter((url): url is string => Boolean(url));
  const organizationId = `${siteUrl}#organization`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: settings.nome,
        description: settings.descricao,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: logoUrl,
        },
        email: settings.contato.email,
        telephone: `+${settings.contato.whatsappDigitos}`,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: `+${settings.contato.whatsappDigitos}`,
          email: settings.contato.email,
          contactType: "sales",
          availableLanguage: ["Portuguese"],
        },
        sameAs,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}#website`,
        url: siteUrl,
        name: settings.nome,
        description: settings.seo.descricao,
        inLanguage: "pt-BR",
        publisher: { "@id": organizationId },
      },
    ],
  };
  const jsonLd = JSON.stringify(structuredData).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}
