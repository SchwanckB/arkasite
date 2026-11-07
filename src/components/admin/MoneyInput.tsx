"use client";

import { useState, type ChangeEvent } from "react";

import { classeInput } from "./FormField";
import { parseBRLParaCentavos, formatBRLSemSimbolo } from "@/lib/money";
import { cn } from "@/lib/utils";

type MoneyInputProps = {
  id?: string;
  /** Valor atual em centavos inteiros - nunca em reais, nunca float. */
  valueCentavos: number;
  onChangeCentavos: (centavos: number) => void;
  placeholder?: string;
  className?: string;
  erro?: boolean;
  "aria-describedby"?: string;
};

/**
 * Campo de dinheiro. Por fora é texto livre (o usuário digita como quiser:
 * "123,45", "1.234,56"), por dentro sempre vira centavos inteiros - a mesma
 * regra do resto do projeto (ver lib/money.ts).
 *
 * O valor exibido só é reformatado ao perder o foco, para não brigar com o
 * usuário no meio da digitação.
 */
export function MoneyInput({
  id,
  valueCentavos,
  onChangeCentavos,
  placeholder = "0,00",
  className,
  erro,
  "aria-describedby": ariaDescribedby,
}: MoneyInputProps) {
  const [texto, setTexto] = useState(() =>
    valueCentavos ? formatBRLSemSimbolo(valueCentavos) : "",
  );

  function aoMudar(e: ChangeEvent<HTMLInputElement>) {
    setTexto(e.target.value);
    const centavos = parseBRLParaCentavos(e.target.value);
    if (centavos !== null) onChangeCentavos(centavos);
  }

  function aoPerderFoco() {
    // Reformata com o valor valido mais recente, descartando digitacao incompleta.
    setTexto(valueCentavos ? formatBRLSemSimbolo(valueCentavos) : "");
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-texto-suave">
        R$
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={texto}
        onChange={aoMudar}
        onBlur={aoPerderFoco}
        placeholder={placeholder}
        aria-invalid={erro}
        aria-describedby={ariaDescribedby}
        className={cn(classeInput(), "pl-9 text-right tabular-nums", className)}
      />
    </div>
  );
}
