import { Reveal, RevealItem } from "./Reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  /**
   * Rotulo curto acima do titulo.
   *
   * SO USE QUANDO ELE INFORMA ALGO QUE O TITULO NAO DIZ - uma contagem, um
   * prazo, uma condicao. "SERVIÇOS" acima de "O que fazemos" e o mesmo
   * rotulo duas vezes, e foi retirado das secoes onde era isso (decisao do
   * dono, 20/11/2026). O padrao de marca continua valendo onde carrega
   * informacao.
   */
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
        // ~60-70 caracteres por linha. Era max-w-2xl (42rem), que a 18px
        // passava de 80 caracteres e cansava a leitura.
        "flex max-w-[34rem] flex-col gap-4",
        centro && "mx-auto items-center text-center",
        className,
      )}
    >
      {sobretitulo ? (
        <RevealItem
          as="span"
          className={cn(
            "text-rotulo font-semibold uppercase tracking-[0.18em]",
            invertido ? "text-areia" : "text-musgo",
          )}
        >
          {sobretitulo}
        </RevealItem>
      ) : null}

      <RevealItem
        as={Titulo}
        className={cn(
          "text-balance font-display text-titulo-md font-semibold leading-[1.1] tracking-[-0.02em] sm:text-titulo-lg lg:text-titulo-xl",
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
