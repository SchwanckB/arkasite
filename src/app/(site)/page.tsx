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

type Fundo = "claro" | "alternado";

/**
 * Secoes de fundo fixo, que nao entram na alternancia:
 * - hero: sempre claro, abre a pagina;
 * - cta: a unica faixa musgo do site, como manda docs/BRAND.md.
 */
const FUNDO_FIXO: Partial<Record<SectionId, true>> = { hero: true, cta: true };

/** Monta a secao pedida ja com o fundo que o ritmo calculou. */
function montar(id: SectionId, fundo: Fundo): ReactNode {
  switch (id) {
    case "hero":
      return <Hero />;
    case "sobre":
      return <Sobre fundo={fundo} />;
    case "diferenciais":
      return <Diferenciais fundo={fundo} />;
    case "servicos":
      return <Servicos fundo={fundo} />;
    case "processo":
      return <Processo fundo={fundo} />;
    case "portfolio":
      return <Portfolio fundo={fundo} />;
    case "faq":
      return <FAQ fundo={fundo} />;
    case "cta":
      return <CTA />;
    case "contato":
      return <Contato fundo={fundo} />;
  }
}

type Ritmo = { fundo: Fundo; fundoGuiado: Fundo };

/**
 * Calcula o fundo de cada secao antes de renderizar.
 *
 * O ritmo claro/areia e decidido AQUI, e nao dentro de cada componente, para
 * sobreviver ao painel: se o dono esconde "Sobre" ou troca a ordem das
 * secoes, a alternancia se recalcula sozinha. Antes o fundo estava fixo em
 * cada arquivo e quatro faixas de areia acabavam coladas no meio da pagina,
 * achatando a leitura justamente onde fica o portfolio.
 *
 * Comeca em 1 porque o hero ja ocupa o degrau "claro": a primeira secao
 * alternavel precisa cair em areia para o contraste aparecer.
 */
function calcularRitmo(ids: readonly SectionId[]): Map<SectionId, Ritmo> {
  const ritmo = new Map<SectionId, Ritmo>();
  let passo = 1;

  for (const id of ids) {
    const fixo = Boolean(FUNDO_FIXO[id]);
    const fundo: Fundo = fixo || passo % 2 === 0 ? "claro" : "alternado";
    if (!fixo) passo += 1;

    // O projeto guiado nao e uma secao cadastrada: ele acompanha Servicos,
    // entao consome o proximo degrau da alternancia.
    const fundoGuiado: Fundo = passo % 2 === 0 ? "claro" : "alternado";
    if (id === "servicos") passo += 1;

    ritmo.set(id, { fundo, fundoGuiado });
  }

  return ritmo;
}

export default async function Home() {
  const sections = await getSections();
  const ritmo = calcularRitmo(sections.map((section) => section.id));

  return (
    <>
      {sections.map((section) => {
        const { fundo, fundoGuiado } = ritmo.get(section.id) ?? {
          fundo: "claro" as const,
          fundoGuiado: "claro" as const,
        };

        return (
          <div key={section.id}>
            {montar(section.id, fundo)}
            {section.id === "servicos" ? <ProjetoGuiado fundo={fundoGuiado} /> : null}
          </div>
        );
      })}
    </>
  );
}
