/**
 * ESQUELETO - propriedade da PARTE 3 (Servicos + CTA).
 */

import { getSection, getSiteSettings } from "@/lib/data";
import { BotaoLink } from "@/components/ui/Button";
import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { linkWhatsapp } from "@/lib/utils";

export async function CTA() {
  const [secao, settings] = await Promise.all([
    getSection("cta"),
    getSiteSettings(),
  ]);

  if (!secao?.visivel) return null;

  const conteudo = secao.conteudo as { botao?: string } | undefined;

  return (
    <Section id="cta" fundo="musgo" espaco="compacto" largura="estreito">
      <Reveal comoLista className="flex flex-col items-center text-center">
        <RevealItem
          as="h2"
          className="text-balance font-display text-3xl leading-tight text-off-white sm:text-4xl"
        >
          {secao.titulo}
        </RevealItem>

        {secao.descricao ? (
          <RevealItem as="p" className="mt-4 max-w-xl text-pretty text-areia">
            {secao.descricao}
          </RevealItem>
        ) : null}

        <RevealItem className="mt-8">
          <BotaoLink
            href={linkWhatsapp(
              settings.contato.whatsappDigitos,
              settings.mensagemWhatsapp,
            )}
            variante="claro"
            tamanho="lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            {conteudo?.botao ?? "Falar com especialista"}
          </BotaoLink>
        </RevealItem>
      </Reveal>
    </Section>
  );
}
