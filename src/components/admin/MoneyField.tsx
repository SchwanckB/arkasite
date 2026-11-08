"use client";

import { useState } from "react";

import { MoneyInput } from "@/components/admin/MoneyInput";

export function MoneyField({
  name,
  label,
  initialCentavos = 0,
}: {
  name: string;
  label: string;
  initialCentavos?: number;
}) {
  const [centavos, setCentavos] = useState(initialCentavos);
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-grafite">
      {label}
      <MoneyInput
        valueCentavos={centavos}
        onChangeCentavos={setCentavos}
        placeholder="0,00"
      />
      <input type="hidden" name={name} value={centavos} />
    </label>
  );
}
