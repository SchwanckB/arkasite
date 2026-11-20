/**
 * Formatacao de datas em portugues do Brasil.
 *
 * Fina camada sobre date-fns com o locale pt-BR ja aplicado, para nenhum
 * componente do painel precisar importar o locale toda vez.
 */

import {
  differenceInCalendarDays,
  format,
  formatDistanceToNow,
  isPast,
  isToday,
  isTomorrow,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";

type DataEntrada = Date | string;

function paraData(data: DataEntrada): Date {
  return typeof data === "string" ? parseISO(data) : data;
}

/** 2026-11-07 -> "7 de novembro de 2026". */
export function formatarData(data: DataEntrada): string {
  return format(paraData(data), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

/** 2026-11-07 -> "07/11/2026". */
export function formatarDataCurta(data: DataEntrada): string {
  return format(paraData(data), "dd/MM/yyyy", { locale: ptBR });
}

/** 2026-11-07T14:30 -> "07/11/2026 às 14:30". */
export function formatarDataHora(data: DataEntrada): string {
  return format(paraData(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

/** -> "há 3 dias", "em 2 horas". Para listas de atividade recente. */
export function formatarRelativo(data: DataEntrada): string {
  return formatDistanceToNow(paraData(data), { locale: ptBR, addSuffix: true });
}

/** Rotulo amigavel para prazos: "Hoje", "Amanhã", "Atrasado", ou a data curta. */
export function rotuloPrazo(data: DataEntrada): string {
  const d = paraData(data);
  if (isToday(d)) return "Hoje";
  if (isTomorrow(d)) return "Amanhã";
  if (isPast(d)) return "Atrasado";
  return formatarDataCurta(d);
}

/** true quando a data ja passou (e nao e hoje). Usado para status "atrasado". */
export function estaAtrasado(data: DataEntrada): boolean {
  const d = paraData(data);
  return isPast(d) && !isToday(d);
}

/** Dias entre hoje e a data (negativo se no passado). */
export function diasAte(data: DataEntrada): number {
  return differenceInCalendarDays(paraData(data), new Date());
}

/* ------------------------------------------------------------------ */
/* Datas que vem do banco                                              */
/* ------------------------------------------------------------------ */

/**
 * Formata uma coluna `date` do Postgres ("2026-11-20") como "20/11/2026".
 *
 * O meio-dia no meio da string nao e enfeite: "2026-11-20" e interpretado
 * como UTC meia-noite, e em America/Sao_Paulo (UTC-3) isso vira o dia 19.
 * Ancorar as 12h deixa a data imune ao fuso.
 *
 * Esta funcao existe porque esse mesmo truque estava copiado em sete telas
 * do painel - bastava uma copia esquecida para um prazo aparecer um dia
 * antes do real.
 */
export function formatarDataBanco(data: string | null | undefined): string {
  if (!data) return "Sem data";
  return formatarDataCurta(`${data}T12:00:00`);
}

/**
 * Formata um `timestamptz` do banco como "20/11/2026 14:30",
 * sempre no fuso de Sao Paulo.
 */
export function formatarDataHoraBanco(data: string): string {
  return new Date(data).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
}

/** Data de hoje em "AAAA-MM-DD", no fuso de Sao Paulo. Serve para comparar com colunas `date`. */
export function hojeNoBanco(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}
