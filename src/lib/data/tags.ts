/**
 * Tags de cache do conteudo publico.
 *
 * As funcoes de leitura em @/lib/data marcam seus resultados com estas tags.
 * Quando o painel publicar uma alteracao (Parte 8), ele chama
 * `revalidateTag(TAGS.xxx)` e o site publico se atualiza sozinho.
 *
 * Proprietario: Parte 0. A Parte 7 reutiliza as MESMAS tags.
 */

export const TAGS = {
  settings: "arka:settings",
  sections: "arka:sections",
  services: "arka:services",
  differentials: "arka:differentials",
  process: "arka:process",
  projects: "arka:projects",
  /** Tag guarda-chuva: revalida tudo que o site publico mostra. */
  site: "arka:site",
} as const;

export type Tag = (typeof TAGS)[keyof typeof TAGS];
