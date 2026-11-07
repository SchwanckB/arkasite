import type { ReactNode } from "react";
import { useId } from "react";

import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  /** Quando omitido, o campo é tratado como opcional e mostra o rótulo "opcional". */
  obrigatorio?: boolean;
  erro?: string;
  dica?: string;
  className?: string;
  children: (idCampo: string, idErro: string | undefined) => ReactNode;
};

/**
 * Envelope de campo de formulário: label ligado por id, dica, erro acessível
 * (aria-describedby) e contador visual de "opcional". Children é uma função
 * para que o input receba o id certo sem cada formulário reinventar o useId.
 *
 * Exemplo:
 *   <FormField label="Nome" obrigatorio erro={erros.nome}>
 *     {(id, idErro) => (
 *       <input id={id} aria-describedby={idErro} aria-invalid={!!erros.nome} ... />
 *     )}
 *   </FormField>
 */
export function FormField({
  label,
  obrigatorio = false,
  erro,
  dica,
  className,
  children,
}: FormFieldProps) {
  const idCampo = useId();
  const idErro = erro ? `${idCampo}-erro` : undefined;
  const idDica = dica ? `${idCampo}-dica` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={idCampo} className="text-sm font-medium text-grafite">
        {label}
        {!obrigatorio && (
          <span className="ml-1.5 font-normal text-texto-suave">
            (opcional)
          </span>
        )}
      </label>

      {children(idCampo, idErro ?? idDica)}

      {dica && !erro ? (
        <p id={idDica} className="text-xs text-texto-suave">
          {dica}
        </p>
      ) : null}

      {erro ? (
        <p id={idErro} role="alert" className="text-xs font-medium text-red-700">
          {erro}
        </p>
      ) : null}
    </div>
  );
}

const CLASSE_INPUT_BASE =
  "w-full rounded-marca border border-borda bg-superficie px-3.5 py-2.5 text-sm text-grafite " +
  "placeholder:text-texto-suave/70 transition-colors duration-[180ms] " +
  "focus:border-musgo focus:outline-none focus:ring-2 focus:ring-musgo/20 " +
  "aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-100";

/** Classe pronta para <input>/<textarea>/<select> customizados fora do FormField. */
export function classeInput(className?: string) {
  return cn(CLASSE_INPUT_BASE, className);
}
