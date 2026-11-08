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

      {projetos.length > 0 && projetos.every((projeto) => projeto.isConcept) ? (
        <div className="mt-8 flex flex-col gap-2 rounded-marca-lg border border-musgo/10 bg-superficie p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-sm font-semibold text-musgo">Estudos visuais criados pela ARKA</p>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-texto-suave">
              Cada prévia ilustra uma ideia de site para um tipo de negócio. São conceitos originais, não projetos publicados de clientes.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-areia px-3 py-1.5 text-xs font-medium text-musgo">
            {projetos.length} conceitos
          </span>
        </div>
      ) : null}

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
