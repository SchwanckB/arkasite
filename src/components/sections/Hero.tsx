/**
 * Hero.
 *
 * Abre com o PRODUTO, nao com a marca. Ate aqui mostrava o simbolo da ARKA
 * flutuando dentro de um circulo de areia - mas a logo ja esta no cabecalho,
 * a 70px dali, e um simbolo nao diz o que a empresa entrega. Quem chega aqui
 * e dono de comercio sem site: o que convence em dois segundos e ver um site
 * pronto de um negocio parecido com o dele. Isso ja existia no repositorio e
 * nao estava sendo usado fora do portfolio: <DeviceFrame> + <MockSite>
 * desenham em CSS sete tipos de comercio reconheciveis.
 *
 * TODO O TEXTO USA <Reveal imediato>: o hero esta acima da dobra e nao pode
 * depender de JavaScript para aparecer. O unico elemento animado da pagina
 * inteira e a moldura a direita, por classe CSS - ver "Momento de carga do
 * hero" em globals.css.
 *
 * NAO HA SOBRETITULO AQUI. A assinatura da marca ("Tecnologia que conecta
 * sua marca ao futuro") vivia em maiusculas espacadas acima de um titulo que
 * ja faz a mesma promessa - duas afirmacoes empilhadas, uma anulando a
 * outra. Ela continua no lockup do rodape, que e onde assinatura mora.
 */

import { brand } from "@/content/brand";
import {
  getDifferentials,
  getProjects,
  getSection,
  type Project,
} from "@/lib/data";
import { BotaoLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DeviceFrame } from "@/components/mockups/DeviceFrame";
import { LinhaCota } from "@/components/ui/LinhaCota";
import { MockSite } from "@/components/mockups/MockSite";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { HeroBackdrop } from "@/components/sections/hero/HeroBackdrop";

/** O projeto que aparece na moldura: o primeiro desenhado para desktop. */
function escolherDestaque(projetos: Project[]): Project | undefined {
  return projetos.find((p) => p.dispositivo === "desktop") ?? projetos[0];
}

/**
 * "Gastronomia" -> "um negocio de gastronomia".
 *
 * As categorias do portfolio sao areas (Gastronomia, Moda, Saude), nao tipos
 * de negocio, entao concordancia direta sai torta: "conceito para
 * Gastronomia". Esta forma serve para todas sem caso especial.
 */
function descreverCategoria(categoria: string): string {
  return `um negócio de ${categoria.toLocaleLowerCase("pt-BR")}`;
}

export async function Hero() {
  const [secao, diferenciais, projetos] = await Promise.all([
    getSection("hero"),
    getDifferentials(),
    getProjects(),
  ]);

  if (!secao?.visivel) return null;

  const conteudo = secao.conteudo as
    | { botaoPrimario?: string; botaoSecundario?: string }
    | undefined;

  const destaque = escolherDestaque(projetos);

  /*
    As tres provas da linha de cota saem dos diferenciais cadastrados no
    painel. Se o dono renomear um diferencial, a cota acompanha - nada aqui
    e texto fixo.
  */
  const provas = diferenciais
    .slice(0, 3)
    .map((d) => ({ id: d.id, rotulo: d.titulo }));

  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden bg-fundo pb-16 pt-24 sm:pb-24 sm:pt-36 lg:pt-40"
    >
      <HeroBackdrop />

      <Container className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          {/* ---------------------------------------------------------- */}
          {/* Texto. Medida limitada para o titulo nao virar faixa larga. */}
          {/* ---------------------------------------------------------- */}
          <Reveal comoLista intervalo={0.08} imediato className="max-w-[34rem]">
            <RevealItem
              as="h1"
              imediato
              className="text-balance font-display text-titulo-lg font-semibold leading-[1.05] tracking-[-0.03em] text-grafite sm:text-titulo-2xl lg:text-titulo-3xl"
            >
              {secao.titulo}
            </RevealItem>

            {secao.descricao ? (
              <RevealItem
                as="p"
                imediato
                className="mt-6 text-pretty text-lg leading-relaxed text-texto-suave"
              >
                {secao.descricao}
              </RevealItem>
            ) : null}

            <RevealItem imediato className="mt-9 flex flex-wrap gap-3">
              <BotaoLink href="#contato" tamanho="lg">
                {conteudo?.botaoPrimario ?? brand.microcopy.botoes.contatoPrimario}
              </BotaoLink>

              {/* O secundario so aponta para o portfolio quando ha portfolio. */}
              {projetos.length > 0 ? (
                <BotaoLink href="#portfolio" variante="secundario" tamanho="lg">
                  {conteudo?.botaoSecundario ?? brand.microcopy.botoes.verPortfolio}
                </BotaoLink>
              ) : (
                <BotaoLink href="#servicos" variante="secundario" tamanho="lg">
                  {brand.microcopy.botoes.verServicos}
                </BotaoLink>
              )}
            </RevealItem>

            {provas.length > 0 ? (
              <RevealItem imediato className="mt-12">
                <LinhaCota
                  itens={provas}
                  aria-label="O que vem em todo projeto"
                />
              </RevealItem>
            ) : null}

            {/*
              Terceiro caminho, rebaixado a texto de apoio: quem ainda nao
              sabe o que quer tem para onde ir sem competir com o botao
              principal. Sem seta colada no fim - o sublinhado ja o anuncia
              como link, e a seta era so enfeite.
            */}
            <RevealItem imediato className="mt-8">
              <a
                href="#projeto-guiado"
                className="inline-flex min-h-11 items-center text-sm text-texto-suave underline decoration-areia decoration-2 underline-offset-4 transition-colors duration-[180ms] hover:text-musgo hover:decoration-musgo"
              >
                Ainda não sabe qual formato escolher?
              </a>
            </RevealItem>
          </Reveal>

          {/* ---------------------------------------------------------- */}
          {/* O produto. Unico elemento animado da pagina inteira.        */}
          {/* ---------------------------------------------------------- */}
          {destaque ? (
            <div className="hidden lg:block">
              {/*
                Regua de construcao: uma cota que mede a largura da peca
                abaixo dela. Mesmo vocabulario da <LinhaCota /> do texto, e
                vem da propria identidade - o brand board constroi o simbolo
                sobre grade e compasso. Decorativa, fora da arvore de
                acessibilidade.
              */}
              <div aria-hidden className="arka-regua mb-5 flex items-center gap-2">
                <span className="h-2 w-px bg-musgo" />
                <span className="h-px flex-1 bg-areia" />
                <span className="h-2 w-px bg-musgo" />
              </div>

              <div className="arka-moldura">
                <DeviceFrame dispositivo="desktop">
                  <MockSite projeto={destaque} />
                </DeviceFrame>
              </div>

              <p className="mt-5 text-sm text-texto-suave">
                {destaque.isConcept
                  ? `Conceito criado pela ARKA para ${descreverCategoria(destaque.categoria)}.`
                  : `${destaque.nome}, ${destaque.categoria.toLocaleLowerCase("pt-BR")}.`}
              </p>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
