import type { NextConfig } from "next";

/**
 * Host do Supabase Storage, extraido da Project URL.
 *
 * Sem isto o <Image /> da biblioteca de midia precisava de `unoptimized`, e
 * cada miniatura baixava o arquivo original inteiro - uma grade com 30 fotos
 * de 3 MB puxava quase 100 MB so para mostrar quadradinhos de 300px.
 *
 * Quando o Supabase nao esta configurado a lista fica vazia, o que e
 * exatamente o certo: sem banco nao existe imagem remota para otimizar.
 */
function hostsDeImagem() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return [];
  try {
    return [{ protocol: "https" as const, hostname: new URL(url).hostname }];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    remotePatterns: hostsDeImagem(),
  },
  partialPrefetching: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "11mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
