/**
 * Hero - PARTE 1 (Header + Hero).
 *
 * A peca mais importante do site: primeira coisa que o visitante ve. Textos
 * vem de getSection("hero"); o unico texto de interface e o rotulo de
 * fallback dos botoes, que vem de brand.microcopy (mesma convencao da CTA).
 */

import { brand } from "@/content/brand";
import { getSection, getSiteSettings } from "@/lib/data";
import { BotaoLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { ArkaSymbol } from "@/components/brand/Logo";
import { HeroBackdrop } from "@/components/sections/hero/HeroBackdrop";

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
      className="relative isolate overflow-hidden bg-fundo pb-20 pt-32 sm:pb-28 sm:pt-40"
    >
      {/* Padrao visual de apoio: bloco musgo solido, atras do conteudo,
          opacidade baixa (ver docs/BRAND.md). Unico padrao desta tela. */}
      <HeroBackdrop />

      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <Reveal comoLista intervalo={0.08} className="max-w-xl">
            <RevealItem className="mb-8">
              <ArkaSymbol variante="simples" tamanho={56} alt="" prioridade />
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
                {conteudo?.botaoPrimario ?? brand.microcopy.botoes.contatoPrimario}
              </BotaoLink>
              <BotaoLink href="#portfolio" variante="secundario" tamanho="lg">
                {conteudo?.botaoSecundario ?? brand.microcopy.botoes.verPortfolio}
              </BotaoLink>
            </RevealItem>
            <RevealItem className="mt-5">
              <a
                href="#projeto-guiado"
                className="inline-flex items-center gap-2 text-sm font-medium text-musgo transition-colors hover:text-musgo-escuro"
              >
                Ainda não sabe qual formato escolher?
                <span aria-hidden>→</span>
              </a>
            </RevealItem>
          </Reveal>

          {/* Visual de apoio em telas grandes: o simbolo em destaque, numa
              moldura circular. Em telas pequenas o simbolo acima do titulo
              ja basta - evita disputar espaco com o texto. */}
          <Reveal
            variante="escala"
            delay={0.3}
            as="div"
            className="hidden lg:flex lg:items-center lg:justify-center"
          >
            <div className="relative flex h-72 w-72 items-center justify-center rounded-full bg-areia-claro ring-1 ring-borda lg:h-80 lg:w-80">
              <ArkaSymbol
                variante="simples"
                tamanho={160}
                alt=""
                className="arka-logo-flutuante"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
