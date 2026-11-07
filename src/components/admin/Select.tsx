import type { SelectHTMLAttributes } from "react";

import { classeInput } from "./FormField";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  erro?: boolean;
};

/** <select> com a mesma pele visual dos demais campos do painel. */
export function Select({ className, erro, ...resto }: SelectProps) {
  return (
    <select
      className={cn(classeInput(), "appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9", className)}
      aria-invalid={erro}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235B5C5C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...resto}
    />
  );
}
