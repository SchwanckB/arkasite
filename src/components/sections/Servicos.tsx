/**
 * ESQUELETO - propriedade da PARTE 3 (Servicos + CTA).
 * Mantenha o export <Servicos /> e o consumo via @/lib/data.
 */

import { getSection, getServices } from "@/lib/data";
import { Card } from "@/components/ui/Card";
import { Icone } from "@/components/ui/Icone";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function Servicos() {
  const [secao, servicos] = await Promise.all([
    getSection("servicos"),
    getServices(),
  ]);

  if (!secao?.visivel) return null;

  return (
    <Section id="servicos" largura="largo">
      <SectionHeading
        sobretitulo={secao.subtitulo}
        titulo={secao.titulo}
        descricao={secao.descricao}
      />

      <Reveal comoLista className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {servicos.map((servico) => (
          <RevealItem key={servico.id}>
            <Card interativo className="flex h-full flex-col">
              <Icone nome={servico.icone} tamanho={28} className="text-musgo" />
              <h3 className="mt-5 font-display text-xl text-grafite">
                {servico.nome}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-texto-suave">
                {servico.descricao}
              </p>
              <ul className="mt-5 flex flex-col gap-2 border-t border-borda pt-5">
                {servico.entregas.map((entrega) => (
                  <li
                    key={entrega}
                    className="flex items-start gap-2 text-sm text-texto-suave"
                  >
                    <Icone
                      nome="Check"
                      tamanho={16}
                      className="mt-0.5 text-salvia"
                    />
                    {entrega}
                  </li>
                ))}
              </ul>
            </Card>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  );
}
