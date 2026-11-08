/**
 * ARKA - linguagem de movimento.
 *
 * Fonte unica das curvas, duracoes e variantes de animacao do projeto inteiro
 * (site publico e painel). Nenhum componente deve inventar easing ou duracao
 * propria: importe daqui. Os mesmos valores estao espelhados como custom
 * properties em src/app/globals.css para transicoes feitas em CSS puro.
 *
 * Proprietario: Parte 0. Outras partes consomem, nao editam.
 */

import type { Transition, Variants } from "motion/react";
import { useReducedMotion } from "motion/react";

/* ------------------------------------------------------------------ */
/* Tokens                                                              */
/* ------------------------------------------------------------------ */

/** Curvas de aceleracao. `marca` e a curva padrao (saida suave, sem overshoot). */
export const easing = {
  /** Curva assinatura da ARKA. Use em praticamente tudo. */
  marca: [0.22, 1, 0.36, 1],
  /** Curva neutra, para transicoes utilitarias (hover, cor, opacidade). */
  suave: [0.4, 0, 0.2, 1],
  /** Entrada com leve aceleracao, para elementos que chegam de fora da tela. */
  entrada: [0, 0, 0.2, 1],
  /** Saida, para elementos que deixam a tela. */
  saida: [0.4, 0, 1, 1],
} as const;

/** Duracoes em segundos (a API do motion usa segundos). */
export const duracao = {
  /** 180ms - hover, foco, troca de cor, micro-feedback. */
  rapida: 0.18,
  /** 380ms - modais, menus, acordeoes, troca de estado visivel. */
  media: 0.38,
  /** 700ms - entrada de secao, reveals de scroll, hero. */
  secao: 0.7,
  /** 4.8s - flutuacao decorativa e discreta do simbolo em destaque. */
  flutuante: 4.8,
} as const;

/** Atrasos padrao para encadeamento. */
export const atraso = {
  curto: 0.06,
  medio: 0.12,
  longo: 0.2,
} as const;

/** Distancias de deslocamento, para manter o movimento coerente. */
export const deslocamento = {
  sutil: 8,
  padrao: 24,
  amplo: 48,
} as const;

/* ------------------------------------------------------------------ */
/* Transicoes prontas                                                  */
/* ------------------------------------------------------------------ */

export const transicao = {
  rapida: { duration: duracao.rapida, ease: easing.suave },
  media: { duration: duracao.media, ease: easing.marca },
  secao: { duration: duracao.secao, ease: easing.marca },
} satisfies Record<string, Transition>;

/* ------------------------------------------------------------------ */
/* Variantes reutilizaveis                                             */
/* ------------------------------------------------------------------ */

/** Aparecimento simples, sem deslocamento. */
export const fade: Variants = {
  oculto: { opacity: 0 },
  visivel: { opacity: 1, transition: transicao.secao },
};

/** Aparecimento subindo. A variante padrao de entrada de secao. */
export const fadeUp: Variants = {
  oculto: { opacity: 0, y: deslocamento.padrao },
  visivel: { opacity: 1, y: 0, transition: transicao.secao },
};

/** Aparecimento descendo, para elementos ancorados no topo (menus, cabecalhos). */
export const fadeDown: Variants = {
  oculto: { opacity: 0, y: -deslocamento.padrao },
  visivel: { opacity: 1, y: 0, transition: transicao.secao },
};

/** Entrada lateral. Use com parcimonia, em pares de colunas. */
export const fadeLeft: Variants = {
  oculto: { opacity: 0, x: deslocamento.amplo },
  visivel: { opacity: 1, x: 0, transition: transicao.secao },
};

export const fadeRight: Variants = {
  oculto: { opacity: 0, x: -deslocamento.amplo },
  visivel: { opacity: 1, x: 0, transition: transicao.secao },
};

/** Leve crescimento, para cartoes e imagens. */
export const escala: Variants = {
  oculto: { opacity: 0, scale: 0.96 },
  visivel: { opacity: 1, scale: 1, transition: transicao.secao },
};

/**
 * Reveal de mascara: o conteudo e descoberto de baixo para cima.
 * Aplique em um wrapper com `overflow: hidden` (o <Reveal variante="mascara" /> ja faz isso).
 */
export const mascara: Variants = {
  oculto: { clipPath: "inset(100% 0% 0% 0%)", y: deslocamento.sutil },
  visivel: {
    clipPath: "inset(0% 0% 0% 0%)",
    y: 0,
    transition: { duration: duracao.secao, ease: easing.marca },
  },
};

/** Linha que se desenha (usada na linha de conexao entre secoes). */
export const linha: Variants = {
  oculto: { scaleY: 0, transformOrigin: "top" },
  visivel: {
    scaleY: 1,
    transformOrigin: "top",
    transition: { duration: 1.1, ease: easing.marca },
  },
};

/**
 * Container de stagger: anima os filhos em sequencia.
 * Use junto com uma das variantes acima nos filhos.
 */
export function stagger(intervalo: number = atraso.curto, inicial = 0): Variants {
  return {
    oculto: {},
    visivel: {
      transition: { staggerChildren: intervalo, delayChildren: inicial },
    },
  };
}

/** Conjunto nomeado, util para escolher variante por prop/string. */
export const variantes = {
  fade,
  fadeUp,
  fadeDown,
  fadeLeft,
  fadeRight,
  escala,
  mascara,
} satisfies Record<string, Variants>;

export type NomeVariante = keyof typeof variantes;

/* ------------------------------------------------------------------ */
/* Scroll                                                              */
/* ------------------------------------------------------------------ */

/**
 * Configuracao padrao do `whileInView`. Dispara uma vez, um pouco antes do
 * elemento entrar totalmente na tela, para a animacao nao parecer atrasada.
 */
export const emVista = {
  once: true,
  amount: 0.25,
  margin: "0px 0px -10% 0px",
} as const;

/* ------------------------------------------------------------------ */
/* Movimento reduzido                                                  */
/* ------------------------------------------------------------------ */

/**
 * Retorna true quando o usuario pediu menos movimento no sistema.
 * Reexportado do motion para que os componentes importem tudo de um lugar so.
 */
export { useReducedMotion };

/**
 * Devolve a variante pedida, ou uma versao sem deslocamento quando o usuario
 * prefere menos movimento. O conteudo continua aparecendo (nunca fica invisivel),
 * so para de se mover.
 */
export function useVariante(nome: NomeVariante = "fadeUp"): Variants {
  const reduzido = useReducedMotion();
  if (reduzido) {
    return {
      oculto: { opacity: 0 },
      visivel: { opacity: 1, transition: { duration: duracao.rapida } },
    };
  }
  return variantes[nome];
}

/** Versao do stagger que some quando o usuario prefere menos movimento. */
export function useStagger(intervalo: number = atraso.curto, inicial = 0): Variants {
  const reduzido = useReducedMotion();
  return stagger(reduzido ? 0 : intervalo, reduzido ? 0 : inicial);
}
