/**
 * sitemap.xml - PARTE 6.
 *
 * A landing page publica funciona como uma unica URL com secoes por ancora.
 * O painel administrativo nunca e incluido.
 *
 * O /admin fica de fora de proposito.
 */

import type { MetadataRoute } from "next";

import { getSiteSettings } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();

  return [
    {
      url: new URL("/", settings.url).toString(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
