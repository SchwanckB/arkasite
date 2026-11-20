/**
 * Servicos - ficha tecnica, nao grade de cartoes.
 *
 * Eram cinco cartoes identicos: mesmo raio, mesma borda, mesma sombra, cada
 * um com icone no alto. Cinco objetos iguais lado a lado nao ajudam a
 * escolher - obrigam a ler tudo para comparar. Quem esta decidindo entre
 * "site institucional" e "loja virtual" precisa confrontar o que vem em cada
 * um, e isso e uma ficha tecnica: nome e descricao de um lado, o que esta
 * incluido do outro, uma regra separando as linhas.
 *
 * O alinhamento segue o que o Astryx chama de edge="flush": o texto da linha
 * comeca na mesma vertical do titulo da secao, e a regra vai de ponta a
 * ponta do conteudo. Sem moldura em volta de cada item.
 *
 * A LINHA NAO E CLICAVEL. So o link do fim e - caso contrario o atalho de
 * WhatsApp viraria um alvo dentro de outro alvo.
 */

import { brand } from "@/content/brand";
import { getSection, getServices, getSiteSettings, getTracking } from "@/lib/data";
import { Icone } from "@/components/ui/Icone";
import { LinkContato } from "@/components/contato/LinkContato";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { linkWhatsapp } from "@/lib/utils";

/** Fundo da secao. Hoje o site inteiro e off-white. */
type FundoSecao = "claro" | "alternado";

export async function Servicos({ fundo = "claro" }: { fundo?: FundoSecao } = {}) {
  const [secao, servicos, settings, tracking] = await Promise.all([
    getSection("servicos"),
    getServices(),
    getSiteSettings(),
    getTracking(),
  ]);

  if (!secao?.visivel) return null;

  if (servicos.length === 0) {
    return (
      <Section fundo={fundo} id="servicos" largura="largo">
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
    <Section fundo={fundo} id="servicos" largura="largo">
      <SectionHeading
        sobretitulo={secao.subtitulo}
        titulo={secao.titulo}
        descricao={secao.descricao}
      />

      <Reveal comoLista className="mt-14">
        {servicos.map((servico) => (
          <RevealItem key={servico.id}>
            <article className="group grid gap-6 border-t border-areia py-8 md:grid-cols-[1.15fr_1fr] md:gap-12 lg:py-10">
              {/* Coluna da esquerda: o que e. */}
              <div className="flex gap-4">
                <span className="mt-0.5 shrink-0 text-musgo">
                  <Icone nome={servico.icone} tamanho={22} />
                </span>

                <div className="min-w-0">
                  <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-grafite">
                    {servico.nome}
                  </h3>
                  <p className="mt-3 max-w-prose text-pretty leading-relaxed text-texto-suave">
                    {servico.descricao}
                  </p>

                  <LinkContato
                    href={linkWhatsapp(
                      settings.contato.whatsappDigitos,
                      brand.whatsapp.mensagemServico(
                        servico.nome.toLocaleLowerCase("pt-BR"),
                      ),
                    )}
                    evento="contato_whatsapp"
                    origem="linha_servico"
                    detalhes={{ servico: servico.slug }}
                    conversao={tracking.googleAdsConversao}
                    aria-label={`Falar sobre ${servico.nome} no WhatsApp`}
                    className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-musgo underline decoration-areia decoration-2 underline-offset-4 transition-colors duration-[180ms] hover:decoration-musgo"
                  >
                    Falar sobre este serviço
                  </LinkContato>
                </div>
              </div>

              {/* Coluna da direita: o que vem incluido. */}
              {servico.entregas.length > 0 ? (
                <ul className="flex flex-col gap-2.5 md:pt-1">
                  {servico.entregas.map((entrega) => (
                    <li
                      key={entrega}
                      className="flex items-baseline gap-3 text-sm text-grafite"
                    >
                      {/*
                        Tick de cota no lugar do check: o mesmo vocabulario da
                        <LinhaCota />, e um check em cinco linhas seguidas
                        vira ruido.
                      */}
                      <span
                        aria-hidden
                        className="h-px w-3 shrink-0 translate-y-[-0.3em] bg-musgo"
                      />
                      {entrega}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          </RevealItem>
        ))}
      </Reveal>

      {/* Fecha a ultima linha: a ficha tem comeco e fim. */}
      <div aria-hidden className="border-t border-areia" />
    </Section>
  );
}
