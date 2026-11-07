/**
 * Pagina 404 - PARTE 6.
 *
 * Sem isto, o Next mostra a tela escura padrao dele dentro do nosso layout
 * claro, com texto em ingles. Esta versao fica na identidade da marca.
 */

import type { Metadata } from "next";

import { BotaoLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icone } from "@/components/ui/Icone";
import { ArkaSymbol } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: true },
};

export default function NaoEncontrada() {
  return (
    <Container
      largura="estreito"
      className="flex min-h-[60vh] flex-col items-center justify-center py-28 text-center"
    >
      <ArkaSymbol variante="simples" tamanho={56} alt="" />

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-salvia">
        Erro 404
      </p>

      <h1 className="mt-4 text-balance font-display text-3xl leading-tight text-grafite sm:text-4xl">
        Esta página não existe
      </h1>

      <p className="mt-4 max-w-md text-pretty leading-relaxed text-texto-suave">
        O endereço pode ter mudado de lugar ou nunca ter existido. Nada de mais
        — é só voltar para o começo.
      </p>

      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <BotaoLink href="/" tamanho="lg">
          <Icone nome="ArrowLeft" tamanho={18} />
          Voltar para o início
        </BotaoLink>
        <BotaoLink href="/#contato" variante="secundario" tamanho="lg">
          Falar com a gente
        </BotaoLink>
      </div>
    </Container>
  );
}
