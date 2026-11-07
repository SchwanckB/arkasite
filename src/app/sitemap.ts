/**
 * sitemap.xml - PARTE 6.
 *
 * Hoje o site e uma pagina unica com ancoras, entao o sitemap tem uma
 * entrada so. Quando existirem paginas de projeto (/portfolio/[slug]),
 * acrescente-as aqui lendo de getProjects().
 *
 * O /admin fica de fora de proposito.
 */

import type { MetadataRoute } from "next";

import { getSiteSettings } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();

  return [
    {
      url: settings.url,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
