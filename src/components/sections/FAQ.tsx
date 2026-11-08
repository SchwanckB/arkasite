import { getFaq, getSection } from "@/lib/data";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function FAQ() {
  const [section, questions] = await Promise.all([
    getSection("faq"),
    getFaq(),
  ]);
  if (!section?.visivel || !questions.length) return null;

  return (
    <Section id="faq" fundo="alternado" largura="padrao">
      <SectionHeading
        sobretitulo={section.subtitulo}
        titulo={section.titulo}
        descricao={section.descricao}
      />
      <div className="mt-10 divide-y divide-borda border-y border-borda">
        {questions.map((item) => (
          <details key={item.id} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-grafite focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-musgo">
              {item.pergunta}
              <span aria-hidden className="text-xl text-musgo transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-texto-suave">{item.resposta}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
