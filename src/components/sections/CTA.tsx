/**
 * Faixa de chamada para acao - PARTE 3.
 *
 * Unica faixa musgo do site antes do rodape. Como o fundo e escuro, todo
 * texto usa off-white/areia e o botao usa a variante "claro".
 */

import { brand } from "@/content/brand";
import { getSection, getSiteSettings, getTracking } from "@/lib/data";
import { BotaoLink } from "@/components/ui/Button";
import { Icone } from "@/components/ui/Icone";
import { LinkContato } from "@/components/contato/LinkContato";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { linkWhatsapp } from "@/lib/utils";

export async function CTA() {
  const [secao, settings, tracking] = await Promise.all([
    getSection("cta"),
    getSiteSettings(),
    getTracking(),
  ]);

  if (!secao?.visivel) return null;

  const conteudo = secao.conteudo as { botao?: string } | undefined;

  return (
    <Section
      id="cta"
      fundo="musgo"
      espaco="normal"
      largura="padrao"
      className="overflow-hidden"
    >
      {/* Grade de pontos: um dos padroes visuais da identidade. Opacidade
          baixa, atras do conteudo, sem competir com o texto. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-off-white) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <Reveal
        comoLista
        intervalo={0.08}
        className="relative flex flex-col items-center text-center"
      >
        <RevealItem
          as="p"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-areia"
        >
          {brand.manifesto.assinatura}
        </RevealItem>

        <RevealItem
          as="h2"
          className="mt-5 text-balance font-display text-3xl leading-tight text-off-white sm:text-4xl"
        >
          {secao.titulo}
        </RevealItem>

        {secao.descricao ? (
          <RevealItem
            as="p"
            className="mt-4 max-w-xl text-pretty leading-relaxed text-areia"
          >
            {secao.descricao}
          </RevealItem>
        ) : null}

        <RevealItem className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <LinkContato
            href={linkWhatsapp(
              settings.contato.whatsappDigitos,
              brand.whatsapp.mensagemOrcamento,
            )}
            evento="contato_whatsapp"
            origem="faixa_cta"
            conversao={tracking.googleAdsConversao}
            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-marca bg-off-white px-8 text-base font-medium text-musgo shadow-suave transition-[background-color,box-shadow,transform] duration-[180ms] hover:-translate-y-px hover:bg-areia-claro hover:shadow-media motion-reduce:transform-none"
          >
            <Icone nome="MessageCircle" tamanho={18} />
            {conteudo?.botao ?? brand.microcopy.botoes.contatoPrimario}
          </LinkContato>

          <BotaoLink
            href="#servicos"
            tamanho="lg"
            /*
              Variante secundaria em fundo escuro. A borda era off-white/30,
              que da 1,99:1 contra o musgo - abaixo dos 3:1 que a WCAG 1.4.11
              exige para o contorno de um componente. Em off-white/55 o botao
              fica visivel sem roubar a atencao do primario.
            */
            className="border border-off-white/55 bg-transparent text-off-white shadow-none hover:border-off-white hover:bg-off-white/10 hover:shadow-none"
          >
            {brand.microcopy.botoes.verServicos}
          </BotaoLink>
        </RevealItem>
      </Reveal>
    </Section>
  );
}
