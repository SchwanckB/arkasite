/**
 * ESQUELETO - propriedade da PARTE 2.
 * A linha de conexao que se desenha entre as etapas e da Parte 2
 * (use a variante `linha` de @/lib/motion).
 */

import { getProcessSteps, getSection } from "@/lib/data";
import { Icone } from "@/components/ui/Icone";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function Processo() {
  const [secao, etapas] = await Promise.all([
    getSection("processo"),
    getProcessSteps(),
  ]);

  if (!secao?.visivel) return null;

  return (
    <Section id="processo" fundo="alternado" largura="largo">
      <SectionHeading
        sobretitulo={secao.subtitulo}
        titulo={secao.titulo}
        descricao={secao.descricao}
      />

      <Reveal comoLista className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {etapas.map((etapa) => (
          <RevealItem key={etapa.id} className="relative">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-musgo text-sm font-semibold text-off-white">
                {etapa.numero}
              </span>
              <Icone nome={etapa.icone} tamanho={20} className="text-salvia" />
            </div>
            <h3 className="mt-5 font-display text-lg text-grafite">
              {etapa.titulo}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-texto-suave">
              {etapa.descricao}
            </p>
            {etapa.detalhe ? (
              <p className="mt-3 text-sm leading-relaxed text-salvia">
                {etapa.detalhe}
              </p>
            ) : null}
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  );
}
