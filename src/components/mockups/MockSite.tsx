/**
 * <MockSite /> - miniatura estilizada de um site, desenhada so com CSS.
 *
 * Serve para ilustrar um projeto do portfolio quando ele ainda nao tem
 * imagem de capa. Nao e uma captura real: e uma representacao abstrata,
 * sempre na paleta da ARKA.
 *
 * Proprietario: Parte 0. A Parte 4 consome dentro de <DeviceFrame />.
 */

import { cn } from "@/lib/utils";
import type { VarianteProjeto } from "@/lib/data/types";

type MockSiteProps = {
  variante?: VarianteProjeto;
  className?: string;
};

/** Barra fina, usada para representar linhas de texto. */
function Linha({ className }: { className?: string }) {
  return <div className={cn("rounded-full bg-grafite/12", className)} />;
}

function Cabecalho() {
  return (
    <div className="flex items-center justify-between border-b border-grafite/8 px-[6%] py-[3.5%]">
      <div className="h-[6px] w-[18%] rounded-full bg-musgo" />
      <div className="flex gap-[4%]">
        <Linha className="h-[4px] w-8" />
        <Linha className="h-[4px] w-8" />
        <Linha className="h-[4px] w-8" />
      </div>
    </div>
  );
}

function Institucional() {
  return (
    <>
      <Cabecalho />
      <div className="flex flex-col gap-[3%] px-[6%] py-[5%]">
        <Linha className="h-[9px] w-[70%] bg-grafite/22" />
        <Linha className="h-[9px] w-[52%] bg-grafite/22" />
        <Linha className="h-[5px] w-[82%]" />
        <div className="mt-[2%] h-[7%] w-[32%] rounded-full bg-musgo" />
      </div>
      <div className="grid grid-cols-3 gap-[3%] px-[6%] pb-[6%]">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="aspect-4/3 rounded-md border border-grafite/8 bg-areia-claro"
          />
        ))}
      </div>
    </>
  );
}

function Loja() {
  return (
    <>
      <Cabecalho />
      <div className="flex items-center justify-between px-[6%] py-[4%]">
        <Linha className="h-[7px] w-[38%] bg-grafite/22" />
        <Linha className="h-[5px] w-[16%] bg-salvia/50" />
      </div>
      <div className="grid grid-cols-4 gap-[2.5%] px-[6%] pb-[6%]">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex flex-col gap-[6px]">
            <div className="aspect-square rounded-md border border-grafite/8 bg-areia-claro" />
            <Linha className="h-[3px] w-[80%]" />
            <Linha className="h-[3px] w-[45%] bg-musgo/40" />
          </div>
        ))}
      </div>
    </>
  );
}

function Landing() {
  return (
    <>
      <Cabecalho />
      <div className="flex flex-col items-center gap-[3%] px-[10%] py-[7%] text-center">
        <Linha className="h-[10px] w-[78%] bg-grafite/22" />
        <Linha className="h-[10px] w-[56%] bg-grafite/22" />
        <Linha className="h-[5px] w-[66%]" />
        <div className="mt-[3%] h-[9%] w-[36%] rounded-full bg-musgo" />
      </div>
      <div className="mx-[6%] mb-[6%] grid grid-cols-2 gap-[3%]">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-[6px] rounded-md border border-grafite/8 bg-areia-claro p-[8%]"
          >
            <div className="h-[8px] w-[8px] rounded-full bg-salvia" />
            <Linha className="h-[3px] w-[70%]" />
            <Linha className="h-[3px] w-[90%]" />
          </div>
        ))}
      </div>
    </>
  );
}

function Servico() {
  return (
    <>
      <Cabecalho />
      <div className="grid grid-cols-5 gap-[4%] px-[6%] py-[5%]">
        <div className="col-span-3 flex flex-col gap-[8px]">
          <Linha className="h-[9px] w-[85%] bg-grafite/22" />
          <Linha className="h-[5px] w-[95%]" />
          <Linha className="h-[5px] w-[70%]" />
          <div className="mt-[6%] h-[14px] w-[48%] rounded-full bg-musgo" />
        </div>
        <div className="col-span-2 aspect-square rounded-md border border-grafite/8 bg-areia-claro" />
      </div>
      <div className="flex gap-[3%] px-[6%] pb-[6%]">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex flex-1 flex-col gap-[5px] rounded-md bg-areia-claro p-[5%]"
          >
            <div className="h-[7px] w-[7px] rounded-full bg-salvia" />
            <Linha className="h-[3px] w-[80%]" />
          </div>
        ))}
      </div>
    </>
  );
}

const LAYOUTS: Record<VarianteProjeto, () => React.ReactElement> = {
  institucional: Institucional,
  loja: Loja,
  landing: Landing,
  servico: Servico,
};

export function MockSite({
  variante = "institucional",
  className,
}: MockSiteProps) {
  const Layout = LAYOUTS[variante] ?? Institucional;

  return (
    <div
      aria-hidden
      className={cn("h-full w-full overflow-hidden bg-off-white", className)}
    >
      <Layout />
    </div>
  );
}
