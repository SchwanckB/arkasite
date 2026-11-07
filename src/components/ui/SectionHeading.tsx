import { Reveal, RevealItem } from "./Reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  /** Rotulo curto acima do titulo (ex.: "Servicos"). */
  sobretitulo?: string;
  titulo: string;
  descricao?: string;
  alinhamento?: "esquerda" | "centro";
  /** Use em secoes de fundo escuro ou musgo. */
  invertido?: boolean;
  className?: string;
  /** Nivel semantico do titulo. O hero usa h1; as demais secoes, h2. */
  nivel?: "h1" | "h2";
};

/** Cabecalho padrao de secao: sobretitulo, titulo e descricao. */
export function SectionHeading({
  sobretitulo,
  titulo,
  descricao,
  alinhamento = "esquerda",
  invertido = false,
  className,
  nivel: Titulo = "h2",
}: SectionHeadingProps) {
  const centro = alinhamento === "centro";

  return (
    <Reveal
      comoLista
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        centro && "mx-auto items-center text-center",
        className,
      )}
    >
      {sobretitulo ? (
        <RevealItem
          as="span"
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.18em]",
            invertido ? "text-areia" : "text-salvia",
          )}
        >
          {sobretitulo}
        </RevealItem>
      ) : null}

      <RevealItem
        as={Titulo}
        className={cn(
          "text-balance font-display text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]",
          invertido ? "text-texto-invertido" : "text-grafite",
        )}
      >
        {titulo}
      </RevealItem>

      {descricao ? (
        <RevealItem
          as="p"
          className={cn(
            "text-pretty text-base leading-relaxed sm:text-lg",
            invertido ? "text-areia" : "text-texto-suave",
          )}
        >
          {descricao}
        </RevealItem>
      ) : null}
    </Reveal>
  );
}
