"use client";

/**
 * <PortfolioGaleria /> - filtros por categoria + grade de projetos.
 *
 * Client Component: recebe a lista ja carregada pelo Server Component
 * <Portfolio /> e cuida so de interacao (filtro, abertura do modal de
 * detalhe). Nao busca dados por conta propria.
 */

import { useMemo, useState } from "react";

import { Reveal, RevealItem } from "@/components/ui/Reveal";
import { brand } from "@/content/brand";
import type { Project } from "@/lib/data/types";
import { cn } from "@/lib/utils";

import { ProjetoCard } from "./ProjetoCard";
import { ProjetoModal } from "./ProjetoModal";

/** Rotulo do filtro que mostra todos os projetos, sem distincao de categoria. */
const TODAS = "Todos";

type PortfolioGaleriaProps = {
  projetos: Project[];
  className?: string;
};

export function PortfolioGaleria({
  projetos,
  className,
}: PortfolioGaleriaProps) {
  const categorias = useMemo(
    () => Array.from(new Set(projetos.map((p) => p.categoria))),
    [projetos],
  );

  const [categoriaAtiva, setCategoriaAtiva] = useState<string>(TODAS);
  const [projetoAberto, setProjetoAberto] = useState<Project | null>(null);
  const [gatilho, setGatilho] = useState<HTMLElement | null>(null);

  const filtrados =
    categoriaAtiva === TODAS
      ? projetos
      : projetos.filter((p) => p.categoria === categoriaAtiva);

  function abrirProjeto(projeto: Project, origem: HTMLElement) {
    setGatilho(origem);
    setProjetoAberto(projeto);
  }

  return (
    <div className={className}>
      <div
        role="group"
        aria-label="Filtrar projetos por categoria"
        className="flex flex-wrap gap-2"
      >
        {[TODAS, ...categorias].map((categoria) => {
          const ativo = categoria === categoriaAtiva;
          return (
            <button
              key={categoria}
              type="button"
              aria-pressed={ativo}
              onClick={() => setCategoriaAtiva(categoria)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-[180ms]",
                ativo
                  ? "border-musgo bg-musgo text-off-white"
                  : "border-borda bg-transparent text-texto-suave hover:border-musgo/40 hover:text-musgo",
              )}
            >
              {categoria}
            </button>
          );
        })}
      </div>

      {filtrados.length === 0 ? (
        <p className="mt-10 text-texto-suave">
          {brand.microcopy.estadosVazios.portfolioFiltro}
        </p>
      ) : (
        // A chave forca a remontagem da grade a cada troca de filtro, para
        // que o efeito de entrada do <Reveal /> dispare de novo (sem ela, os
        // itens que ja estao na tela nao animariam ao trocar de categoria).
        <Reveal
          key={categoriaAtiva}
          comoLista
          className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3"
        >
          {filtrados.map((projeto) => (
            <RevealItem key={projeto.id} className="h-full">
              <ProjetoCard projeto={projeto} onAbrir={abrirProjeto} />
            </RevealItem>
          ))}
        </Reveal>
      )}

      <ProjetoModal
        projeto={projetoAberto}
        onFechar={() => setProjetoAberto(null)}
        elementoRetornoFoco={gatilho}
      />
    </div>
  );
}
