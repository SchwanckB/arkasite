/**
 * ESQUELETO - propriedade da PARTE 2 (Sobre / Diferenciais / Processo).
 * Mantenha o export <Sobre /> e o consumo via @/lib/data.
 */

import { getSection } from "@/lib/data";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function Sobre() {
  const secao = await getSection("sobre");
  if (!secao?.visivel) return null;

  return (
    <Section id="sobre" fundo="alternado">
      <SectionHeading
        sobretitulo={secao.subtitulo}
        titulo={secao.titulo}
        descricao={secao.descricao}
      />
    </Section>
  );
}
