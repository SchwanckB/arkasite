import type { ReactNode } from "react";

import { CTA } from "@/components/sections/CTA";
import { Contato } from "@/components/sections/Contato";
import { Diferenciais } from "@/components/sections/Diferenciais";
import { FAQ } from "@/components/sections/FAQ";
import { Hero } from "@/components/sections/Hero";
import { Portfolio } from "@/components/sections/Portfolio";
import { ProjetoGuiado } from "@/components/sections/ProjetoGuiado";
import { Processo } from "@/components/sections/Processo";
import { Servicos } from "@/components/sections/Servicos";
import { Sobre } from "@/components/sections/Sobre";
import { getSections, type SectionId } from "@/lib/data";

const COMPONENTES: Record<SectionId, ReactNode> = {
  hero: <Hero />,
  sobre: <Sobre />,
  diferenciais: <Diferenciais />,
  servicos: <Servicos />,
  processo: <Processo />,
  portfolio: <Portfolio />,
  faq: <FAQ />,
  cta: <CTA />,
  contato: <Contato />,
};

export default async function Home() {
  const sections = await getSections();
  return (
    <>
      {sections.map((section) => (
        <div key={section.id}>
          {COMPONENTES[section.id]}
          {section.id === "servicos" ? <ProjetoGuiado /> : null}
        </div>
      ))}
    </>
  );
}
