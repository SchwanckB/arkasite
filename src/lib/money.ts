/**
 * Dinheiro em centavos inteiros, sem float em nenhum ponto.
 *
 * Regra do projeto (ver docs/ARCHITECTURE.md): todo valor monetario e um
 * inteiro de centavos (amount_cents). Nunca armazene nem calcule em reais
 * como numero de ponto flutuante - erro de arredondamento em dinheiro nao
 * e aceitavel.
 */

/** Formata centavos como BRL: 12345 -> "R$ 123,45". */
export function formatBRL(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

/** Formata sem o simbolo da moeda: 12345 -> "123,45". */
export function formatBRLSemSimbolo(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(centavos / 100);
}

/**
 * Converte texto digitado pelo usuario em centavos inteiros.
 *
 * Aceita os formatos comuns de digitacao em pt-BR: "123,45", "1.234,56",
 * "123.45" (teclado numerico as vezes usa ponto) e "123". Devolve null se
 * o texto nao for um numero valido.
 */
export function parseBRLParaCentavos(texto: string): number | null {
  const limpo = texto.trim();
  if (!limpo) return null;

  // Remove separador de milhar (ponto quando ha virgula decimal depois)
  // e normaliza a virgula decimal para ponto.
  const temVirgulaDecimal = /,\d{1,2}$/.test(limpo);
  const normalizado = temVirgulaDecimal
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo.replace(",", ".");

  const valor = Number(normalizado);
  if (!Number.isFinite(valor)) return null;

  return Math.round(valor * 100);
}

/** Soma uma lista de valores em centavos. Util para totais de filtro. */
export function somarCentavos(valores: readonly number[]): number {
  return valores.reduce((total, v) => total + v, 0);
}
