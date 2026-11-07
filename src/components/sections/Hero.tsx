/**
 * ESQUELETO - propriedade da PARTE 1 (Header + Hero).
 *
 * A Parte 0 entrega esta versao funcional para o site ja subir. A Parte 1
 * substitui o conteudo visual mantendo: o nome do arquivo, o export <Hero />
 * e o consumo de dados via @/lib/data.
 */

import { getSection, getSiteSettings } from "@/lib/data";
import { BotaoLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { ArkaSymbol } from "@/components/brand/Logo";

export async function Hero() {
  const [secao, settings] = await Promise.all([
    getSection("hero"),
    getSiteSettings(),
  ]);

  if (!secao?.visivel) return null;

  const conteudo = secao.conteudo as
    | { botaoPrimario?: string; botaoSecundario?: string }
    | undefined;

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-fundo pb-20 pt-32 sm:pb-28 sm:pt-40"
    >
      <Container className="relative">
        <Reveal comoLista intervalo={0.08} className="max-w-3xl">
          <RevealItem className="mb-8">
            <ArkaSymbol variante="simples" tamanho={64} alt="" prioridade />
          </RevealItem>

          <RevealItem
            as="p"
            className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-salvia"
          >
            {secao.subtitulo ?? settings.tagline}
          </RevealItem>

          <RevealItem
            as="h1"
            className="text-balance font-display text-4xl leading-[1.1] text-grafite sm:text-5xl lg:text-6xl"
          >
            {secao.titulo}
          </RevealItem>

          {secao.descricao ? (
            <RevealItem
              as="p"
              className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-texto-suave"
            >
              {secao.descricao}
            </RevealItem>
          ) : null}

          <RevealItem className="mt-10 flex flex-wrap gap-3">
            <BotaoLink href="#contato" tamanho="lg">
              {conteudo?.botaoPrimario ?? "Falar com especialista"}
            </BotaoLink>
            <BotaoLink href="#portfolio" variante="secundario" tamanho="lg">
              {conteudo?.botaoSecundario ?? "Ver portfólio"}
            </BotaoLink>
          </RevealItem>
        </Reveal>
      </Container>
    </section>
  );
}
