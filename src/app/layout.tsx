import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";

import { getSiteSettings } from "@/lib/data";

import "./globals.css";

/**
 * Tipografia.
 *
 * A fonte primaria da identidade e a ASTRON (ver docs/BRAND.md). Ela nao esta
 * disponivel como fonte web e o dono ainda nao forneceu os arquivos
 * licenciados, entao usamos MONTSERRAT como substituta de display enquanto
 * isso (pendencia 2 em docs/PENDENCIAS.md). A secundaria, INTER, e a oficial.
 *
 * Para trocar pela ASTRON depois, veja o passo a passo em docs/PENDENCIAS.md:
 * so este arquivo precisa mudar.
 */
const fonteDisplay = Montserrat({
  variable: "--font-arka-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const fonteSans = Inter({
  variable: "--font-arka-sans",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(settings.url),
    title: {
      default: settings.seo.titulo,
      template: `%s | ${settings.nome}`,
    },
    description: settings.seo.descricao,
    applicationName: settings.nome,
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: settings.nome,
      title: settings.seo.titulo,
      description: settings.seo.descricao,
      images: [{ url: settings.seo.imagemOg, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seo.titulo,
      description: settings.seo.descricao,
      images: [settings.seo.imagemOg],
    },
    icons: {
      icon: [
        { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
        { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: "/apple-icon.png",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#4E5A46",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fonteDisplay.variable} ${fonteSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Atalho de acessibilidade: primeiro item alcancavel por teclado. */}
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-marca focus:bg-musgo focus:px-4 focus:py-2 focus:text-off-white"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
