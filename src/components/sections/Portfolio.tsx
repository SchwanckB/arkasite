/**
 * Secao de portfolio - PARTE 4.
 *
 * Server Component assincrono: busca os dados em @/lib/data e delega toda a
 * interacao (filtro por categoria, modal de detalhe) para <PortfolioGaleria />,
 * um Client Component em ./portfolio.
 *
 * Regra de imagem mantida do esqueleto: se o projeto tem coverUrl, a imagem
 * entra com next/image dentro do <DeviceFrame />; sem capa, usa <MockSite />.
 * Essa decisao vive dentro de <ProjetoCard /> e <ProjetoModal /> para nao
 * duplicar o calculo de alinhamento da grade.
 */

import { brand } from "@/content/brand";
import { getProjects, getSection } from "@/lib/data";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

import { PortfolioGaleria } from "./portfolio/PortfolioGaleria";

export async function Portfolio() {
  const [secao, projetos] = await Promise.all([
    getSection("portfolio"),
    getProjects(),
  ]);

  if (!secao?.visivel) return null;

  return (
    <Section id="portfolio" fundo="alternado" largura="largo">
      <SectionHeading
        sobretitulo={secao.subtitulo}
        titulo={secao.titulo}
        descricao={secao.descricao}
      />

      {projetos.length === 0 ? (
        <p className="mt-10 text-texto-suave">
          {brand.microcopy.estadosVazios.portfolio}
        </p>
      ) : (
        <PortfolioGaleria projetos={projetos} className="mt-14" />
      )}
    </Section>
  );
}
