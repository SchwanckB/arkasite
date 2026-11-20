"use client";

/**
 * Botao flutuante de WhatsApp.
 *
 * Padrao consolidado no comercio brasileiro e o caminho mais curto possivel
 * ate uma conversa: antes, falar pelo WhatsApp exigia rolar ate a secao de
 * servicos, ate a faixa verde ou ate o rodape.
 *
 * Decisoes:
 * - So aparece depois que o hero sai da tela. No topo ele seria redundante
 *   (o CTA principal esta a poucos pixels dali) e ainda cobriria conteudo.
 * - z-40, abaixo do cabecalho e da gaveta do menu (z-50), para nunca ficar
 *   por cima do menu aberto.
 * - 56px de diametro, bem acima do piso de 44px de alvo de toque.
 * - Respeita prefers-reduced-motion: sem movimento, so aparece e some.
 * - Afasta-se da borda inferior com safe-area, para nao brigar com a barra
 *   de gestos do iPhone.
 */

import { useEffect, useState } from "react";

import { Icone } from "@/components/ui/Icone";
import { registrarConversao } from "@/lib/conversoes";
import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

type WhatsappFlutuanteProps = {
  href: string;
  /** Rotulo de conversao do Google Ads, vindo de getTracking(). */
  conversao?: string | null;
};

export function WhatsappFlutuante({ href, conversao }: WhatsappFlutuanteProps) {
  const [visivel, setVisivel] = useState(false);
  const reduzido = useReducedMotion();

  /*
    Mesmo padrao do <HeaderBar />: um listener passivo de scroll que le o
    retangulo do hero. O estado inicial ja e o correto para quem abre a
    pagina no topo, entao a primeira avaliacao so muda alguma coisa quando a
    pessoa entra por uma ancora (/#contato) ou numa pagina sem hero.
  */
  useEffect(() => {
    function avaliar() {
      const hero = document.getElementById("hero");
      // Sem hero na pagina (404, por exemplo), o atalho aparece de cara.
      setVisivel(hero ? hero.getBoundingClientRect().bottom < 120 : true);
    }

    avaliar();
    window.addEventListener("scroll", avaliar, { passive: true });
    return () => window.removeEventListener("scroll", avaliar);
  }, []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a ARKA no WhatsApp"
      aria-hidden={!visivel}
      tabIndex={visivel ? undefined : -1}
      onClick={() =>
        registrarConversao(
          "contato_whatsapp",
          { placement: "botao_flutuante" },
          conversao,
        )
      }
      className={cn(
        "fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full",
        "bg-musgo text-off-white shadow-alta",
        "transition-[opacity,transform,background-color] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:bg-musgo-escuro focus-visible:outline-offset-4",
        "sm:bottom-7 sm:right-7",
        visivel
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
        !reduzido && !visivel && "translate-y-3 scale-95",
        "motion-reduce:transition-opacity motion-reduce:transform-none",
      )}
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <Icone nome="MessageCircle" tamanho={26} />
    </a>
  );
}
