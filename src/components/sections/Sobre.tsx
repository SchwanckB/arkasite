/**
 * Secao "Sobre" - PARTE 2.
 *
 * Server Component assincrono. Combina o texto institucional de getSection
 * (titulo/descricao da secao) com o conteudo de marca de getBrand (manifesto,
 * missao, visao, valores, texto longo e os tres indicadores de diferenciacao).
 *
 * Hierarquia pensada para nao virar paredao de texto: texto corrido + cartao
 * de missao/visao lado a lado, manifesto como bloco de destaque em fundo
 * musgo, indicadores numerados e valores em cartoes pequenos no final.
 */

import { getBrand, getSection } from "@/lib/data";
import { Card } from "@/components/ui/Card";
import { Icone } from "@/components/ui/Icone";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function Sobre() {
  const [secao, marca] = await Promise.all([getSection("sobre"), getBrand()]);

  if (!secao?.visivel) return null;

  const [primeiroParagrafo, ...demaisParagrafos] = marca.sobre.longo;

  return (
    <Section id="sobre" fundo="alternado">
      <SectionHeading
        sobretitulo={secao.subtitulo}
        titulo={secao.titulo}
        descricao={secao.descricao}
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        {/* Texto institucional: primeiro paragrafo em destaque, os demais mais suaves. */}
        <Reveal as="div" className="flex flex-col gap-5">
          {primeiroParagrafo ? (
            <RevealItem
              as="p"
              className="text-pretty text-lg font-medium leading-snug text-grafite sm:text-xl"
            >
              {primeiroParagrafo}
            </RevealItem>
          ) : null}
          {demaisParagrafos.map((paragrafo) => (
            <RevealItem
              key={paragrafo}
              as="p"
              className="text-pretty text-base leading-relaxed text-texto-suave"
            >
              {paragrafo}
            </RevealItem>
          ))}
        </Reveal>

        {/* Missao e visao, lado a lado com o texto em telas largas. */}
        <Reveal as="div">
          <Card className="flex h-full flex-col gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-salvia">
                Missão
              </span>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-texto-suave">
                {marca.missao}
              </p>
            </div>
            <div className="border-t border-borda pt-6">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-salvia">
                Visão
              </span>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-texto-suave">
                {marca.visao}
              </p>
            </div>
          </Card>
        </Reveal>
      </div>

      {/* Manifesto: bloco de destaque sobre fundo musgo. */}
      <Reveal className="relative mt-16 overflow-hidden rounded-marca-lg bg-musgo px-6 py-10 sm:px-10 sm:py-14">
        <Icone
          nome="Quote"
          tamanho={72}
          className="pointer-events-none absolute -top-4 right-6 text-off-white/10 sm:right-10"
        />
        <Reveal comoLista className="relative flex flex-col gap-4">
          {marca.manifesto.paragrafos.map((paragrafo) => (
            <RevealItem
              key={paragrafo}
              as="p"
              className="text-pretty text-lg font-medium leading-snug text-texto-invertido sm:text-xl"
            >
              {paragrafo}
            </RevealItem>
          ))}
        </Reveal>
        <p className="relative mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-texto-invertido/70">
          — {marca.manifesto.assinatura}
        </p>
      </Reveal>

      {/* Indicadores de diferenciacao: frases, nao numeros. */}
      <Reveal comoLista className="mt-16 grid gap-6 sm:grid-cols-3">
        {marca.indicadores.map((indicador, indice) => (
          <RevealItem key={indicador.titulo}>
            <div className="flex h-full flex-col gap-3 border-t-2 border-musgo pt-5">
              <span className="text-3xl font-bold text-salvia">
                {`0${indice + 1}`}
              </span>
              <h3 className="font-display text-lg text-grafite">
                {indicador.titulo}
              </h3>
              <p className="text-pretty text-sm leading-relaxed text-texto-suave">
                {indicador.descricao}
              </p>
            </div>
          </RevealItem>
        ))}
      </Reveal>

      {/* Valores da marca. */}
      <div className="mt-16">
        <Reveal as="h3" className="text-balance font-display text-2xl text-grafite">
          Nossos valores
        </Reveal>

        <Reveal
          comoLista
          className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5"
        >
          {marca.valores.map((valor) => (
            <RevealItem key={valor.nome}>
              <Card className="h-full">
                <h4 className="font-display text-base text-grafite">
                  {valor.nome}
                </h4>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-texto-suave">
                  {valor.descricao}
                </p>
              </Card>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
