/**
 * <DeviceFrame /> - moldura de notebook, tablet ou celular.
 *
 * Envolve qualquer conteudo (um <MockSite /> ou uma imagem de capa real)
 * para apresentar um projeto do portfolio. Desenhada so com CSS, na paleta
 * da marca.
 *
 * Proprietario: Parte 0. A Parte 4 consome.
 */

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { DispositivoProjeto } from "@/lib/data/types";

type DeviceFrameProps = {
  children: ReactNode;
  dispositivo?: DispositivoProjeto;
  className?: string;
  /** Mostra a barra de navegador no topo (so no desktop). */
  comBarra?: boolean;
};

/** Proporcao interna da tela de cada aparelho. */
const PROPORCOES: Record<DispositivoProjeto, string> = {
  desktop: "aspect-16/10",
  tablet: "aspect-4/3",
  mobile: "aspect-[9/19]",
};

function BarraNavegador() {
  return (
    <div className="flex items-center gap-2 border-b border-grafite/10 bg-areia-claro px-3 py-2">
      <span className="h-2 w-2 rounded-full bg-grafite/20" />
      <span className="h-2 w-2 rounded-full bg-grafite/20" />
      <span className="h-2 w-2 rounded-full bg-grafite/20" />
      <span className="ml-2 h-3 flex-1 rounded-full bg-off-white" />
    </div>
  );
}

export function DeviceFrame({
  children,
  dispositivo = "desktop",
  className,
  comBarra = true,
}: DeviceFrameProps) {
  if (dispositivo === "mobile") {
    return (
      <div className={cn("mx-auto w-full max-w-[220px]", className)}>
        <div className="rounded-[2rem] border border-grafite/15 bg-grafite p-[6px] shadow-media">
          <div
            className={cn(
              "relative overflow-hidden rounded-[1.6rem] bg-off-white",
              PROPORCOES.mobile,
            )}
          >
            {/* Ilha do alto-falante */}
            <div className="absolute left-1/2 top-2 z-10 h-[6px] w-[34%] -translate-x-1/2 rounded-full bg-grafite/80" />
            {children}
          </div>
        </div>
      </div>
    );
  }

  if (dispositivo === "tablet") {
    return (
      <div className={cn("mx-auto w-full max-w-[420px]", className)}>
        <div className="rounded-[1.5rem] border border-grafite/15 bg-grafite p-[10px] shadow-media">
          <div
            className={cn(
              "overflow-hidden rounded-[0.9rem] bg-off-white",
              PROPORCOES.tablet,
            )}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  // desktop: tela + base de notebook
  return (
    <div className={cn("mx-auto w-full", className)}>
      <div className="rounded-t-xl border border-grafite/15 bg-grafite p-[8px] pb-0 shadow-media">
        <div
          className={cn(
            "overflow-hidden rounded-t-md bg-off-white",
            PROPORCOES.desktop,
          )}
        >
          {comBarra ? <BarraNavegador /> : null}
          <div className="h-full w-full">{children}</div>
        </div>
      </div>
      {/*
        Base do notebook. Mantida dentro da largura do pai de proposito:
        qualquer coisa mais larga que 100% cria rolagem horizontal na pagina
        quando o portfolio vira uma coluna so no celular.
      */}
      <div className="h-[10px] w-full rounded-b-xl border border-t-0 border-grafite/15 bg-grafite-suave" />
    </div>
  );
}
