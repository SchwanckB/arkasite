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
import { getProjects, getSections, type SectionId } from "@/lib/data";

/**
 * Qual componente responde por cada secao cadastrada.
 *
 * Todas as secoes de conteudo ficam em off-white: o fundo e o mesmo do
 * comeco ao fim da pagina. A separacao entre elas vem do respiro vertical e
 * do cabecalho de secao, nao de faixas de cor. A unica cor cheia e a faixa
 * musgo da chamada, como manda docs/BRAND.md.
 */
function montar(id: SectionId): ReactNode {
  switch (id) {
    case "hero":
      return <Hero />;
    case "sobre":
      return <Sobre />;
    case "diferenciais":
      return <Diferenciais />;
    case "servicos":
      return <Servicos />;
    case "processo":
      return <Processo />;
    case "portfolio":
      return <Portfolio />;
    case "faq":
      return <FAQ />;
    case "cta":
      return <CTA />;
    case "contato":
      return <Contato />;
  }
}

export default async function Home() {
  const [sections, projetos] = await Promise.all([
    getSections(),
    getProjects(),
  ]);

  /*
    Sem projeto publicado no painel, a secao de portfolio nao entra na
    pagina - nem como bloco vazio, nem como ancora no menu. Um portfolio
    anunciado e vazio conta contra a marca; melhor nao existir.
  */
  const temPortfolio = projetos.length > 0;
  const visiveis = sections.filter(
    (section) => section.id !== "portfolio" || temPortfolio,
  );

  return (
    <>
      {visiveis.map((section) => (
        <div key={section.id}>
          {montar(section.id)}
          {/* O projeto guiado nao e uma secao cadastrada: acompanha Servicos. */}
          {section.id === "servicos" ? <ProjetoGuiado /> : null}
        </div>
      ))}
    </>
  );
}
