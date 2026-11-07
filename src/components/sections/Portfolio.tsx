/**
 * ESQUELETO - propriedade da PARTE 4 (Portfolio publico).
 *
 * A Parte 4 acrescenta o modal acessivel de detalhe do projeto e os filtros.
 * Regra ja implementada aqui e que deve ser mantida: se o projeto tiver
 * coverUrl, mostre a imagem com next/image dentro do mockup; senao, <MockSite />.
 */

import Image from "next/image";

import { getProjects, getSection } from "@/lib/data";
import { DeviceFrame } from "@/components/mockups/DeviceFrame";
import { MockSite } from "@/components/mockups/MockSite";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

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

      <Reveal comoLista className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {projetos.map((projeto) => (
          <RevealItem key={projeto.id} className="flex flex-col">
            <DeviceFrame dispositivo={projeto.dispositivo}>
              {projeto.coverUrl ? (
                <Image
                  src={projeto.coverUrl}
                  alt={projeto.coverAlt ?? projeto.nome}
                  width={1280}
                  height={800}
                  className="h-full w-full object-cover"
                />
              ) : (
                <MockSite variante={projeto.variante} />
              )}
            </DeviceFrame>

            <div className="mt-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-salvia">
                  {projeto.categoria}
                </span>
                {projeto.isConcept ? (
                  <span className="rounded-full bg-areia px-2 py-0.5 text-[11px] font-medium text-musgo">
                    Conceito
                  </span>
                ) : null}
              </div>
              <h3 className="mt-2 font-display text-lg text-grafite">
                {projeto.nome}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-texto-suave">
                {projeto.descricao}
              </p>
            </div>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  );
}
