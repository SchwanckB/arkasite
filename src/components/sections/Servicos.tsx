/**
 * Secao de servicos - PARTE 3.
 *
 * Server Component assincrono. Os dados vem de @/lib/data; os textos de
 * interface, de brand.microcopy. Cada cartao oferece um atalho direto de
 * WhatsApp com a mensagem ja preenchida para aquele servico.
 */

import { brand } from "@/content/brand";
import { getSection, getServices, getSiteSettings } from "@/lib/data";
import { Card } from "@/components/ui/Card";
import { Icone } from "@/components/ui/Icone";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { linkWhatsapp } from "@/lib/utils";

export async function Servicos() {
  const [secao, servicos, settings] = await Promise.all([
    getSection("servicos"),
    getServices(),
    getSiteSettings(),
  ]);

  if (!secao?.visivel) return null;

  if (servicos.length === 0) {
    return (
      <Section id="servicos" largura="largo">
        <SectionHeading
          sobretitulo={secao.subtitulo}
          titulo={secao.titulo}
          descricao={secao.descricao}
        />
        <p className="mt-10 text-texto-suave">
          {brand.microcopy.estadosVazios.servicos}
        </p>
      </Section>
    );
  }

  return (
    <Section id="servicos" largura="largo">
      <SectionHeading
        sobretitulo={secao.subtitulo}
        titulo={secao.titulo}
        descricao={secao.descricao}
      />

      <Reveal
        comoLista
        className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        {servicos.map((servico) => (
          <RevealItem key={servico.id} className="h-full">
            <Card interativo className="group flex h-full flex-col">
              <span className="flex h-12 w-12 items-center justify-center rounded-marca bg-areia-claro text-musgo transition-colors duration-[180ms] group-hover:bg-musgo group-hover:text-off-white">
                <Icone nome={servico.icone} tamanho={24} />
              </span>

              <h3 className="mt-5 font-display text-xl text-grafite">
                {servico.nome}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-texto-suave">
                {servico.descricao}
              </p>

              {/* mt-auto empurra a lista e o atalho para a base, deixando
                  todos os cartoes alinhados mesmo com textos de tamanhos
                  diferentes. */}
              <ul className="mt-6 flex flex-col gap-2 border-t border-borda pt-5">
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
                    <span>{entrega}</span>
                  </li>
                ))}
              </ul>

              <a
                href={linkWhatsapp(
                  settings.contato.whatsappDigitos,
                  brand.whatsapp.mensagemServico(servico.nome.toLowerCase()),
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-musgo transition-colors duration-[180ms] hover:text-musgo-escuro"
              >
                Falar sobre este serviço
                <Icone
                  nome="ArrowRight"
                  tamanho={16}
                  className="transition-transform duration-[180ms] group-hover:translate-x-0.5 motion-reduce:transform-none"
                />
                <span className="sr-only"> no WhatsApp</span>
              </a>
            </Card>
          </RevealItem>
        ))}
      </Reveal>
    </Section>
  );
}
