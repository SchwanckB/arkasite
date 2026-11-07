"use client";

/**
 * HeaderBar - parte interativa do cabecalho (PARTE 1).
 *
 * Client Component separado do <Header /> (Server Component) porque precisa
 * de estado de scroll, IntersectionObserver e o menu mobile. O <Header />
 * continua sendo quem busca os dados em @/lib/data.
 */

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { BotaoLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icone } from "@/components/ui/Icone";
import { Logo } from "@/components/brand/Logo";
import { brand } from "@/content/brand";
import { duracao, easing, useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type ItemMenu = { id: string; rotulo: string };

type HeaderBarProps = {
  itens: ItemMenu[];
  nomeSite: string;
};

export function HeaderBar({ itens, nomeSite }: HeaderBarProps) {
  const [rolado, setRolado] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [ativo, setAtivo] = useState<string | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);
  const botaoMenuRef = useRef<HTMLButtonElement>(null);
  const reduzido = useReducedMotion();

  /* -------------------------------------------------------------- */
  /* Fundo do cabecalho ao rolar                                     */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    function aoRolar() {
      setRolado(window.scrollY > 8);
    }
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  /* -------------------------------------------------------------- */
  /* Secao ativa (IntersectionObserver)                               */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    const elementos = itens
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elementos.length === 0) return;

    const observer = new IntersectionObserver(
      (entradas) => {
        setAtivo((atual) => {
          const visiveis = entradas.filter((e) => e.isIntersecting);
          if (visiveis.length === 0) return atual;
          const maisVisivel = visiveis.reduce((a, b) =>
            a.intersectionRatio >= b.intersectionRatio ? a : b,
          );
          return maisVisivel.target.id;
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    elementos.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [itens]);

  /* -------------------------------------------------------------- */
  /* Menu mobile: travar scroll, Esc, foco preso, fechar no resize   */
  /* -------------------------------------------------------------- */
  const fechar = useCallback(() => {
    setMenuAberto(false);
    botaoMenuRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!menuAberto) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [menuAberto]);

  useEffect(() => {
    if (!menuAberto) return;

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        fechar();
        return;
      }

      // Foco preso dentro do menu.
      if (evento.key !== "Tab" || !drawerRef.current) return;
      const focaveis = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focaveis.length === 0) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }

    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [menuAberto, fechar]);

  // Leva o foco para dentro do menu assim que ele abre.
  useEffect(() => {
    if (!menuAberto || !drawerRef.current) return;
    const primeiroFocavel = drawerRef.current.querySelector<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    primeiroFocavel?.focus();
  }, [menuAberto]);

  // Fecha sozinho se a tela crescer para o layout de desktop.
  useEffect(() => {
    const consulta = window.matchMedia("(min-width: 768px)");
    function aoMudar(evento: MediaQueryListEvent) {
      if (evento.matches) setMenuAberto(false);
    }
    consulta.addEventListener("change", aoMudar);
    return () => consulta.removeEventListener("change", aoMudar);
  }, []);

  const transicaoBackdrop = {
    duration: reduzido ? duracao.rapida : duracao.media,
    ease: easing.suave,
  };
  const transicaoGaveta = {
    duration: reduzido ? duracao.rapida : duracao.media,
    ease: easing.marca,
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        rolado
          ? "border-borda/60 bg-fundo/90 shadow-suave backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <Container largura="largo">
        <div className="flex h-18 items-center justify-between gap-6">
          <Link href="/" aria-label={nomeSite} className="shrink-0" onClick={fechar}>
            <Logo variante="horizontal" altura={34} prioridade />
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
            {itens.map((item) => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                aria-current={ativo === item.id ? "true" : undefined}
                className={cn(
                  "text-sm transition-colors duration-[180ms]",
                  ativo === item.id
                    ? "font-medium text-musgo"
                    : "text-texto-suave hover:text-musgo",
                )}
              >
                {item.rotulo}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <BotaoLink href="#contato" tamanho="sm" className="hidden sm:inline-flex">
              {brand.microcopy.botoes.contatoPrimario}
            </BotaoLink>

            <button
              ref={botaoMenuRef}
              type="button"
              aria-expanded={menuAberto}
              aria-controls="menu-mobile"
              aria-label={
                menuAberto
                  ? brand.microcopy.botoes.fecharMenu
                  : brand.microcopy.botoes.abrirMenu
              }
              onClick={() => setMenuAberto((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-marca text-grafite transition-colors duration-[180ms] hover:bg-musgo/8 md:hidden"
            >
              <Icone nome={menuAberto ? "X" : "Menu"} tamanho={22} />
            </button>
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {menuAberto ? (
          <motion.div
            key="backdrop"
            aria-hidden
            onClick={fechar}
            className="fixed inset-0 z-40 bg-grafite/40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transicaoBackdrop}
          />
        ) : null}

        {menuAberto ? (
          <motion.div
            key="drawer"
            id="menu-mobile"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu principal"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col gap-1 overflow-y-auto bg-fundo p-6 pt-7 shadow-alta md:hidden"
            initial={reduzido ? { opacity: 0 } : { opacity: 0, x: "100%" }}
            animate={reduzido ? { opacity: 1 } : { opacity: 1, x: 0 }}
            exit={reduzido ? { opacity: 0 } : { opacity: 0, x: "100%" }}
            transition={transicaoGaveta}
          >
            <div className="flex items-center justify-between">
              <Logo variante="horizontal" altura={28} />
              <button
                type="button"
                aria-label={brand.microcopy.botoes.fecharMenu}
                onClick={fechar}
                className="inline-flex h-10 w-10 items-center justify-center rounded-marca text-grafite transition-colors duration-[180ms] hover:bg-musgo/8"
              >
                <Icone nome="X" tamanho={22} />
              </button>
            </div>

            <nav aria-label="Principal" className="mt-8 flex flex-col gap-1">
              {itens.map((item) => (
                <Link
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={fechar}
                  aria-current={ativo === item.id ? "true" : undefined}
                  className={cn(
                    "rounded-marca px-3 py-3 text-base transition-colors duration-[180ms]",
                    ativo === item.id
                      ? "bg-areia-claro font-medium text-musgo"
                      : "text-texto-suave hover:bg-musgo/5 hover:text-musgo",
                  )}
                >
                  {item.rotulo}
                </Link>
              ))}
            </nav>

            <BotaoLink href="#contato" tamanho="lg" onClick={fechar} className="mt-6">
              {brand.microcopy.botoes.contatoPrimario}
            </BotaoLink>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
