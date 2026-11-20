"use client";

/**
 * Tela de erro do site publico.
 *
 * A camada de dados ja cai no conteudo de reserva quando o Supabase falha,
 * entao chegar aqui e raro. Mas quando chega, o visitante nao pode ficar com
 * a tela crua do Next: ele veio para falar com a ARKA, e o contato direto
 * precisa continuar ao alcance mesmo com o site quebrado.
 *
 * Por isso esta tela leva WhatsApp e Instagram como saida, e nao so um
 * "tentar de novo".
 */

import { useEffect } from "react";

import { BotaoLink, Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icone } from "@/components/ui/Icone";
import { ArkaSymbol } from "@/components/brand/Logo";
import { site } from "@/content/site";
import { linkWhatsapp } from "@/lib/utils";

export default function ErroSite({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[site] Erro nao tratado na pagina publica.", error);
  }, [error]);

  return (
    <Container
      largura="estreito"
      className="flex min-h-[60vh] flex-col items-center justify-center py-28 text-center"
    >
      <ArkaSymbol variante="simples" tamanho={56} alt="" />

      <p className="mt-8 text-rotulo font-semibold uppercase tracking-[0.2em] text-musgo">
        Algo saiu do ar
      </p>

      <h1 className="mt-4 text-balance font-display text-titulo-md leading-tight text-grafite sm:text-titulo-lg">
        Esta página não carregou
      </h1>

      <p className="mt-4 max-w-md text-pretty leading-relaxed text-texto-suave">
        É uma falha momentânea do nosso lado, não do seu. Tente de novo em
        instantes — ou fale com a gente agora mesmo, que o contato direto
        continua funcionando.
      </p>

      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Button onClick={reset} tamanho="lg">
          <Icone nome="RotateCcw" tamanho={18} />
          Tentar de novo
        </Button>

        {/*
          Conteudo estatico de propósito: se a leitura do banco for justamente
          o que falhou, getSiteSettings() falharia de novo aqui.
        */}
        <BotaoLink
          href={linkWhatsapp(
            site.contato.whatsappDigitos,
            site.mensagemWhatsapp,
          )}
          variante="secundario"
          tamanho="lg"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icone nome="MessageCircle" tamanho={18} />
          Falar no WhatsApp
        </BotaoLink>
      </div>

      {site.redes.instagram ? (
        <a
          href={site.redes.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-musgo underline-offset-4 hover:underline"
        >
          <Icone nome="AtSign" tamanho={16} />
          Ou pelo Instagram
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
      ) : null}
    </Container>
  );
}
