"use client";

/**
 * <ProjetoModal /> - modal acessivel de detalhe de um projeto do portfolio.
 *
 * Segue o mesmo padrao de foco preso / Esc / trava de scroll usado no menu
 * mobile de <HeaderBar /> (PARTE 1), adaptado para um dialogo central em vez
 * de uma gaveta lateral.
 *
 * Contrato de acessibilidade:
 * - role="dialog" + aria-modal + aria-labelledby no titulo.
 * - foco move para dentro ao abrir, fica preso (Tab/Shift+Tab), fecha com
 *   Esc e com clique no fundo, devolve o foco a quem abriu ao fechar.
 * - trava o scroll do body enquanto estiver aberto.
 * - entrada e saida animadas com AnimatePresence, usando os tokens de
 *   duracao/curva de src/lib/motion.ts.
 */

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useId, useRef } from "react";

import { DeviceFrame } from "@/components/mockups/DeviceFrame";
import { MockSite } from "@/components/mockups/MockSite";
import { Icone } from "@/components/ui/Icone";
import { brand } from "@/content/brand";
import { duracao, easing, useReducedMotion } from "@/lib/motion";
import type { DispositivoProjeto, Project } from "@/lib/data/types";

/** Altura fixa da area do mockup dentro do modal, em pixels. */
const ALTURA_AREA = 320;

/** Largura maxima do <DeviceFrame />, calculada para ~ALTURA_AREA de altura total. */
const LARGURA_MAXIMA: Record<DispositivoProjeto, string> = {
  desktop: "max-w-[400px]",
  tablet: "max-w-[390px]",
  mobile: "max-w-[140px]",
};

const SELETOR_FOCAVEIS = 'a[href], button:not([disabled])';

type ProjetoModalProps = {
  projeto: Project | null;
  onFechar: () => void;
  /** Elemento que abriu o modal. Recebe o foco de volta ao fechar. */
  elementoRetornoFoco: HTMLElement | null;
};

export function ProjetoModal({
  projeto,
  onFechar,
  elementoRetornoFoco,
}: ProjetoModalProps) {
  const painelRef = useRef<HTMLDivElement>(null);
  const tituloId = useId();
  const reduzido = useReducedMotion();
  const aberto = projeto !== null;

  const fechar = useCallback(() => {
    onFechar();
    elementoRetornoFoco?.focus();
  }, [onFechar, elementoRetornoFoco]);

  /* -------------------------------------------------------------- */
  /* Trava o scroll do body enquanto o modal estiver aberto          */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    if (!aberto) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [aberto]);

  /* -------------------------------------------------------------- */
  /* Esc fecha, Tab fica preso dentro do painel                      */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    if (!aberto) return;

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        fechar();
        return;
      }

      if (evento.key !== "Tab" || !painelRef.current) return;
      const focaveis =
        painelRef.current.querySelectorAll<HTMLElement>(SELETOR_FOCAVEIS);
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
  }, [aberto, fechar]);

  /* -------------------------------------------------------------- */
  /* Leva o foco para dentro do modal assim que ele abre              */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    if (!aberto || !painelRef.current) return;
    const primeiroFocavel = painelRef.current.querySelector<HTMLElement>(
      SELETOR_FOCAVEIS,
    );
    primeiroFocavel?.focus();
  }, [aberto]);

  const transicaoFundo = {
    duration: reduzido ? duracao.rapida : duracao.media,
    ease: easing.suave,
  };
  const transicaoPainel = {
    duration: reduzido ? duracao.rapida : duracao.media,
    ease: easing.marca,
  };

  return (
    <AnimatePresence>
      {projeto ? (
        <motion.div
          key="portfolio-modal-fundo"
          aria-hidden
          onClick={fechar}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-grafite/50 p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transicaoFundo}
        >
          <motion.div
            key="portfolio-modal-painel"
            ref={painelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            onClick={(evento) => evento.stopPropagation()}
            className="relative my-auto max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-marca-lg bg-fundo p-6 shadow-alta sm:p-8"
            initial={
              reduzido ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }
            }
            animate={
              reduzido ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              reduzido ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }
            }
            transition={transicaoPainel}
          >
            <button
              type="button"
              onClick={fechar}
              aria-label={brand.microcopy.botoes.fechar}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-marca text-grafite transition-colors duration-[180ms] hover:bg-musgo/8"
            >
              <Icone nome="X" tamanho={20} />
            </button>

            <div className="flex items-center gap-2 pr-12">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-salvia">
                {projeto.categoria}
              </span>
              {projeto.isConcept ? (
                <span className="rounded-full bg-areia px-2 py-0.5 text-[11px] font-medium text-musgo">
                  {brand.microcopy.etiquetas.conceito}
                </span>
              ) : null}
            </div>

            <h3
              id={tituloId}
              className="mt-2 pr-12 font-display text-2xl text-grafite"
            >
              {projeto.nome}
            </h3>

            {projeto.isConcept ? (
              <p className="mt-1 text-sm text-texto-suave">
                {brand.microcopy.etiquetas.conceitoExplicacao}
              </p>
            ) : null}

            <div
              className="mt-6 flex items-center justify-center rounded-marca bg-areia-claro"
              style={{ height: ALTURA_AREA }}
            >
              <DeviceFrame
                dispositivo={projeto.dispositivo}
                className={LARGURA_MAXIMA[projeto.dispositivo]}
              >
                {projeto.coverUrl ? (
                  <Image
                    src={projeto.coverUrl}
                    alt={
                      projeto.coverAlt ??
                      brand.alt.mockupProjeto(projeto.nome, projeto.dispositivo)
                    }
                    width={1280}
                    height={800}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <MockSite variante={projeto.variante} />
                )}
              </DeviceFrame>
            </div>

            <p className="mt-6 text-pretty text-base leading-relaxed text-texto-suave">
              {projeto.descricao}
            </p>

            {projeto.tags.length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-2">
                {projeto.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-borda px-3 py-1 text-xs text-texto-suave"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}

            {projeto.gallery && projeto.gallery.length > 0 ? (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-grafite">
                  Galeria do projeto
                </h4>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {projeto.gallery.map((src, indice) => (
                    <div
                      key={`${src}-${indice}`}
                      className="relative aspect-4/3 overflow-hidden rounded-marca border border-borda"
                    >
                      <Image
                        src={src}
                        alt={`${projeto.nome} - imagem ${indice + 1} da galeria`}
                        fill
                        sizes="(min-width: 640px) 33vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {projeto.liveUrl ? (
              <a
                href={projeto.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex h-11 items-center gap-1.5 rounded-marca bg-musgo px-6 text-sm font-medium text-off-white transition-colors duration-[180ms] hover:bg-musgo-escuro"
              >
                Visitar site
                <Icone nome="ArrowUpRight" tamanho={16} />
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
