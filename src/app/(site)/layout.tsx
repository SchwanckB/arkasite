import type { ReactNode } from "react";
import type { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { StructuredData } from "@/components/seo/StructuredData";
import { Rastreamento } from "@/components/tracking/Rastreamento";
import { getAppearanceTheme, getSiteSettings } from "@/lib/data";
import type { CSSProperties } from "react";

type ThemeVariables = CSSProperties & {
  "--color-musgo": string;
  "--color-musgo-escuro": string;
  "--color-musgo-claro": string;
  "--color-destaque": string;
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    alternates: {
      canonical: new URL("/", settings.url).toString(),
    },
  };
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [tema, settings] = await Promise.all([getAppearanceTheme(), getSiteSettings()]);
  const variaveis: ThemeVariables = tema === "grafite"
    ? {
      "--color-musgo": "#252626",
      "--color-musgo-escuro": "#1d1e1e",
      "--color-musgo-claro": "#3a3b3b",
      "--color-destaque": "#252626",
    }
    : {
      "--color-musgo": "#4e5a46",
      "--color-musgo-escuro": "#3c4636",
      "--color-musgo-claro": "#637058",
      "--color-destaque": "#4e5a46",
    };
  return (
    <div className="flex min-h-full flex-col" style={variaveis}>
      <Header />
      <main id="conteudo" className="flex-1">
        <StructuredData settings={settings} />
        {children}
      </main>
      <Footer />
      <Rastreamento />
    </div>
  );
}
