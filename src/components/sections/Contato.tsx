/**
 * ESQUELETO - propriedade da PARTE 5 (Contato + Footer).
 *
 * A Parte 5 implementa o formulario real: validacao com zod, Server Action
 * ou Route Handler chamando createLead() de @/lib/data, estados de carregamento,
 * sucesso e erro honesto quando nem banco nem e-mail estiverem configurados.
 */

import { getSection, getSiteSettings } from "@/lib/data";
import { BotaoLink } from "@/components/ui/Button";
import { Icone } from "@/components/ui/Icone";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { linkWhatsapp } from "@/lib/utils";

export async function Contato() {
  const [secao, settings] = await Promise.all([
    getSection("contato"),
    getSiteSettings(),
  ]);

  if (!secao?.visivel) return null;

  return (
    <Section id="contato" largura="largo">
      <SectionHeading
        sobretitulo={secao.subtitulo}
        titulo={secao.titulo}
        descricao={secao.descricao}
      />

      <Reveal className="mt-12 flex flex-wrap gap-3">
        <BotaoLink
          href={linkWhatsapp(
            settings.contato.whatsappDigitos,
            settings.mensagemWhatsapp,
          )}
          tamanho="lg"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icone nome="MessageCircle" tamanho={18} />
          WhatsApp
        </BotaoLink>

        <BotaoLink
          href={`mailto:${settings.contato.email}`}
          variante="secundario"
          tamanho="lg"
          // O e-mail e uma palavra so e nao cabe em 375px: deixe quebrar.
          className="h-auto whitespace-normal break-all py-3 text-left"
        >
          <Icone nome="Mail" tamanho={18} />
          {settings.contato.email}
        </BotaoLink>
      </Reveal>
    </Section>
  );
}
