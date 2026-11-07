/**
 * robots.txt - PARTE 6.
 *
 * O painel administrativo (/admin) nunca deve ser indexado. A regra ja fica
 * aqui para a Parte 7 nao precisar lembrar.
 */

import type { MetadataRoute } from "next";

import { getSiteSettings } from "@/lib/data";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${settings.url}/sitemap.xml`,
  };
}
