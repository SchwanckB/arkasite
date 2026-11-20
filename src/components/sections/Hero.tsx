/**
 * Hero - PARTE 1 (Header + Hero).
 *
 * A peca mais importante do site: primeira coisa que o visitante ve. Textos
 * vem de getSection("hero"); o unico texto de interface e o rotulo de
 * fallback dos botoes, que vem de brand.microcopy (mesma convencao da CTA).
 *
 * TUDO AQUI USA <Reveal imediato>. O hero esta acima da dobra, entao nao pode
 * depender de JavaScript para aparecer: antes, o <h1> saia do servidor com
 * opacity:0 e so pintava depois da hidratacao, o que jogava o LCP la para
 * frente e deixava a pagina em branco para quem tem conexao ruim.
 */

import { brand } from "@/content/brand";
import { getDifferentials, getSection, getSiteSettings } from "@/lib/data";
import { BotaoLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icone } from "@/components/ui/Icone";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { ArkaSymbol } from "@/components/brand/Logo";
import { HeroBackdrop } from "@/components/sections/hero/HeroBackdrop";

export async function Hero() {
  const [secao, settings, diferenciais] = await Promise.all([
    getSection("hero"),
    getSiteSettings(),
    getDifferentials(),
  ]);

  if (!secao?.visivel) return null;

  const conteudo = secao.conteudo as
    | { botaoPrimario?: string; botaoSecundario?: string }
    | undefined;

  /*
    Faixa de confianca: tres itens em icone + rotulo logo abaixo do botao.
    E um elemento da propria identidade - os mockups de celular e de notebook
    do brand board mostram exatamente isso sob a chamada principal. O conteudo
    reaproveita os diferenciais ja cadastrados, entao o painel continua sendo
    o dono do texto e nada foi inventado aqui.
  */
  const provas = diferenciais.slice(0, 3);

  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden bg-fundo pb-16 pt-24 sm:pb-24 sm:pt-36 lg:pt-40"
    >
      {/* Padrao visual de apoio: bloco musgo solido, atras do conteudo,
          opacidade baixa (ver docs/BRAND.md). Unico padrao desta tela. */}
      <HeroBackdrop />

      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <Reveal comoLista intervalo={0.08} imediato className="max-w-xl">
            {/* O simbolo isolado so entra a partir de lg. No celular a logo do
                cabecalho fica a 70px daqui: repetir a marca duas vezes seguidas
                so empurrava a proposta de valor para baixo da dobra. */}
            <RevealItem imediato className="mb-8 hidden lg:block">
              <ArkaSymbol variante="simples" tamanho={56} alt="" />
            </RevealItem>

            <RevealItem
              as="p"
              imediato
              className="mb-4 text-rotulo font-semibold uppercase tracking-[0.2em] text-musgo"
            >
              {secao.subtitulo ?? settings.tagline}
            </RevealItem>

            <RevealItem
              as="h1"
              imediato
              className="text-balance font-display text-titulo-lg leading-[1.1] text-grafite sm:text-titulo-2xl lg:text-titulo-3xl"
            >
              {secao.titulo}
            </RevealItem>

            {secao.descricao ? (
              <RevealItem
                as="p"
                imediato
                className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-texto-suave"
              >
                {secao.descricao}
              </RevealItem>
            ) : null}

            <RevealItem imediato className="mt-8 flex flex-wrap gap-3">
              <BotaoLink href="#contato" tamanho="lg">
                {conteudo?.botaoPrimario ?? brand.microcopy.botoes.contatoPrimario}
              </BotaoLink>
              <BotaoLink href="#portfolio" variante="secundario" tamanho="lg">
                {conteudo?.botaoSecundario ?? brand.microcopy.botoes.verPortfolio}
              </BotaoLink>
            </RevealItem>

            {provas.length > 0 ? (
              <RevealItem
                imediato
                as="ul"
                className="mt-8 flex flex-col gap-x-6 gap-y-2.5 border-t border-borda pt-6 sm:flex-row sm:flex-wrap"
              >
                {provas.map((prova) => (
                  <li
                    key={prova.id}
                    className="flex items-center gap-2 text-sm font-medium text-grafite"
                  >
                    <Icone
                      nome={prova.icone}
                      tamanho={18}
                      className="text-musgo"
                    />
                    {prova.titulo}
                  </li>
                ))}
              </RevealItem>
            ) : null}

            {/* Terceiro caminho, deliberadamente rebaixado a texto: quem ainda
                nao sabe o que quer tem para onde ir sem disputar atencao com
                o botao principal. */}
            <RevealItem imediato className="mt-6">
              <a
                href="#projeto-guiado"
                className="inline-flex min-h-11 items-center gap-2 text-sm text-texto-suave transition-colors hover:text-musgo"
              >
                Ainda não sabe qual formato escolher?
                <span aria-hidden className="font-medium text-musgo">→</span>
              </a>
            </RevealItem>
          </Reveal>

          {/* Visual de apoio em telas grandes: o simbolo em destaque, numa
              moldura circular. Em telas pequenas o simbolo do cabecalho ja
              basta - evita disputar espaco com o texto. */}
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
