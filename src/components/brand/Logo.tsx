/**
 * <Logo /> e <ArkaSymbol /> - unicas formas permitidas de exibir a marca.
 *
 * REGRA DE MARCA (docs/BRAND.md): nunca redesenhe, vetorize a mao, recolora
 * fora das variantes abaixo, nem distorca a logo. Se precisar de uma variante
 * que nao existe aqui, peca o arquivo ao dono e adicione-o em public/brand/.
 *
 * SOBRE QUAL FUNDO USAR CADA VARIANTE
 * A logo da ARKA e verde musgo: ela some sobre fundos escuros. Por isso cada
 * variante declara para que tipo de fundo foi feita. Em secoes com
 * fundo="escuro" ou fundo="musgo", use as variantes de fundo escuro.
 *
 * Os arquivos vieram de um brand board em JPEG. As versoes "-transparente"
 * foram geradas por npm run brand:assets, que apenas recorta o fundo solido
 * (a forma da logo nao e tocada). Ver docs/PENDENCIAS.md, item 1.
 */

import Image from "next/image";

import { cn } from "@/lib/utils";

type Arquivo = { src: string; largura: number; altura: number };

/* ------------------------------------------------------------------ */
/* Logo completa                                                       */
/* ------------------------------------------------------------------ */

export type VarianteLogo =
  /** Simbolo + ARKA TECHNOLOGIES lado a lado. Padrao do cabecalho. FUNDO CLARO. */
  | "horizontal"
  /** Horizontal com a assinatura da marca. Use no rodape. FUNDO CLARO. */
  | "horizontal-tagline"
  /** Simbolo acima do nome. Espacos estreitos e verticais. FUNDO CLARO. */
  | "vertical"
  /** Pilula verde com a logo em branco. Use sobre FUNDO ESCURO. */
  | "badge-escuro"
  /** Quadrado verde com a logo em branco. Use sobre FUNDO ESCURO. */
  | "tile-escuro";

const ARQUIVOS_LOGO: Record<VarianteLogo, Arquivo> = {
  horizontal: {
    src: "/brand/logo-horizontal-transparente.png",
    largura: 570,
    altura: 170,
  },
  "horizontal-tagline": {
    src: "/brand/logo-horizontal-tagline-transparente.png",
    largura: 570,
    altura: 185,
  },
  vertical: {
    src: "/brand/logo-vertical-transparente.png",
    largura: 450,
    altura: 395,
  },
  "badge-escuro": {
    src: "/brand/badge-horizontal-musgo.png",
    largura: 280,
    altura: 116,
  },
  "tile-escuro": {
    src: "/brand/tile-quadrado-musgo.png",
    largura: 232,
    altura: 238,
  },
};

type LogoProps = {
  variante?: VarianteLogo;
  /** Altura renderizada em pixels. A largura acompanha a proporcao. */
  altura?: number;
  className?: string;
  /** true quando a logo e um dos primeiros elementos visiveis (cabecalho, hero). */
  prioridade?: boolean;
};

export function Logo({
  variante = "horizontal",
  altura = 40,
  className,
  prioridade = false,
}: LogoProps) {
  const arquivo = ARQUIVOS_LOGO[variante];
  const largura = Math.round((arquivo.largura / arquivo.altura) * altura);

  return (
    <Image
      src={arquivo.src}
      alt="ARKA Technologies"
      width={largura}
      height={altura}
      priority={prioridade}
      className={cn("select-none", className)}
      style={{ height: altura, width: largura }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Simbolo isolado                                                     */
/* ------------------------------------------------------------------ */

export type VarianteSimbolo =
  /** O "A" em verde musgo, sem moldura. FUNDO CLARO. */
  | "simples"
  /** "A" branco sobre circulo musgo. Melhor leitura em tamanho pequeno. */
  | "circulo-musgo"
  /** "A" musgo sobre circulo off-white. Use sobre FUNDO ESCURO. */
  | "circulo-claro"
  /** "A" branco sobre quadrado arredondado musgo. Avatar, icone de app. */
  | "squircle-musgo"
  /** "A" musgo sobre quadrado arredondado off-white. Use sobre FUNDO ESCURO. */
  | "squircle-claro";

const ARQUIVOS_SIMBOLO: Record<VarianteSimbolo, Arquivo> = {
  simples: {
    src: "/brand/logo-simbolo-transparente.png",
    largura: 249,
    altura: 206,
  },
  "circulo-musgo": {
    src: "/brand/simbolo-circulo-musgo.png",
    largura: 150,
    altura: 140,
  },
  "circulo-claro": {
    src: "/brand/simbolo-circulo-claro.png",
    largura: 152,
    altura: 136,
  },
  "squircle-musgo": {
    src: "/brand/simbolo-squircle-musgo.png",
    largura: 152,
    altura: 136,
  },
  "squircle-claro": {
    src: "/brand/simbolo-squircle-claro.png",
    largura: 152,
    altura: 136,
  },
};

type SimboloProps = {
  variante?: VarianteSimbolo;
  /** Altura renderizada em pixels. Minimo recomendado: 24px (ver BRAND.md). */
  tamanho?: number;
  className?: string;
  prioridade?: boolean;
  /**
   * Texto alternativo. Use "" quando o simbolo for decorativo e o nome da
   * marca ja aparecer em texto por perto.
   */
  alt?: string;
};

export function ArkaSymbol({
  variante = "simples",
  tamanho = 40,
  className,
  prioridade = false,
  alt = "ARKA Technologies",
}: SimboloProps) {
  const arquivo = ARQUIVOS_SIMBOLO[variante];
  const largura = Math.round((arquivo.largura / arquivo.altura) * tamanho);

  return (
    <Image
      src={arquivo.src}
      alt={alt}
      width={largura}
      height={tamanho}
      priority={prioridade}
      aria-hidden={alt === "" || undefined}
      className={cn("select-none", className)}
      style={{ height: tamanho, width: largura }}
    />
  );
}
