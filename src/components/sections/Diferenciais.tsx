/**
 * ESQUELETO - propriedade da PARTE 2.
 * Mantenha o export <Diferenciais /> e o consumo via @/lib/data.
 */

import { getDifferentials, getSection } from "@/lib/data";
import { Card } from "@/components/ui/Card";
import { Icone } from "@/components/ui/Icone";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function Diferenciais() {
  const [secao, itens] = await Promise.all([
    getSection("diferenciais"),
    getDifferentials(),
  ]);

  if (!secao?.visivel) return null;

  return (
    <Section id="diferenciais" largura="largo">
      <SectionHeading
        sobretitulo={secao.subtitulo}
        titulo={secao.titulo}
        descricao={secao.descricao}
        alinhamento="centro"
      />

      <Reveal
        comoLista
        className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {itens.map((item) => (
          <RevealItem key={item.id}>
            <Card interativo className="flex h-full flex-col">
              <Icone nome={item.icone} tamanho={28} className="text-musgo" />
              <h3 className="mt-5 font-display text-lg text-grafite">
                {item.titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-texto-suave">
                {item.descricao}
              </p>

              {/* Prova concreta do diferencial, escrita pela Parte C. */}
              {item.apoio ? (
                <div className="mt-auto flex items-start gap-2 border-t border-borda pt-4">
                  <Icone
                    nome="Check"
                    tamanho={14}
                    className="mt-0.5 shrink-0 text-salvia"
                  />
                  <p className="text-xs leading-relaxed text-texto-suave">
                    {item.apoio}
                  </p>
                </div>
              ) : null}
            </Card>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  );
}
