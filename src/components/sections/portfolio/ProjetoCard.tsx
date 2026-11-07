"use client";

/**
 * <ProjetoCard /> - cartao de um projeto na grade do portfolio.
 *
 * Mostra o mockup (capa real, se houver, senao <MockSite />), categoria,
 * etiqueta de conceito e um botao que abre o modal de detalhe.
 *
 * Alinhamento da grade: a area do mockup tem altura fixa (ALTURA_AREA) e o
 * aparelho e centralizado dentro dela, com uma largura maxima por tipo de
 * dispositivo (LARGURA_MAXIMA). Os numeros foram calculados a partir da
 * moldura de cada <DeviceFrame /> (padding + borda + barra de navegador) para
 * que desktop, tablet e celular ocupem aproximadamente a mesma altura total
 * - sem isso, o celular (proporcao 9/19) fica muito mais alto que o desktop
 * (16/10) e desalinha a grade.
 */

import Image from "next/image";
import { useRef } from "react";

import { DeviceFrame } from "@/components/mockups/DeviceFrame";
import { MockSite } from "@/components/mockups/MockSite";
import { Card } from "@/components/ui/Card";
import { Icone } from "@/components/ui/Icone";
import { brand } from "@/content/brand";
import type { DispositivoProjeto, Project } from "@/lib/data/types";

/** Altura fixa da area do mockup, em pixels. */
const ALTURA_AREA = 280;

/** Largura maxima do <DeviceFrame />, calculada para ~ALTURA_AREA de altura total. */
const LARGURA_MAXIMA: Record<DispositivoProjeto, string> = {
  desktop: "max-w-[340px]",
  tablet: "max-w-[335px]",
  mobile: "max-w-[120px]",
};

type ProjetoCardProps = {
  projeto: Project;
  onAbrir: (projeto: Project, origem: HTMLElement) => void;
};

export function ProjetoCard({ projeto, onAbrir }: ProjetoCardProps) {
  const botaoRef = useRef<HTMLButtonElement>(null);

  return (
    <Card interativo className="group flex h-full flex-col">
      <div
        className="flex items-center justify-center"
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

      <div className="mt-6 flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-salvia">
            {projeto.categoria}
          </span>
          {projeto.isConcept ? (
            <span className="rounded-full bg-areia px-2 py-0.5 text-[11px] font-medium text-musgo">
              {brand.microcopy.etiquetas.conceito}
              {/* Explicacao acessivel: nao depende so do visual da etiqueta. */}
              <span className="sr-only">
                : {brand.microcopy.etiquetas.conceitoExplicacao}
              </span>
            </span>
          ) : null}
        </div>

        <h3 className="mt-2 font-display text-lg text-grafite">
          {projeto.nome}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-texto-suave">
          {projeto.descricao}
        </p>

        <button
          ref={botaoRef}
          type="button"
          onClick={() => {
            if (botaoRef.current) onAbrir(projeto, botaoRef.current);
          }}
          className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-musgo transition-colors duration-[180ms] hover:text-musgo-escuro"
        >
          {brand.microcopy.botoes.verProjeto}
          <Icone
            nome="ArrowRight"
            tamanho={16}
            className="transition-transform duration-[180ms] group-hover:translate-x-0.5 motion-reduce:transform-none"
          />
          <span className="sr-only"> {projeto.nome}</span>
        </button>
      </div>
    </Card>
  );
}
