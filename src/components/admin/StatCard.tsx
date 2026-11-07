import { cn } from "@/lib/utils";
import { Icone } from "@/components/ui/Icone";

type StatCardProps = {
  rotulo: string;
  valor: string;
  icone?: string;
  /** Variação em relação ao período anterior. Positivo = verde, negativo = vermelho discreto. */
  variacao?: { texto: string; positiva: boolean };
  className?: string;
};

/** Cartão de indicador numérico, usado no dashboard e nas visões gerais dos módulos. */
export function StatCard({
  rotulo,
  valor,
  icone,
  variacao,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-marca-lg border border-borda bg-superficie p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-texto-suave">
          {rotulo}
        </span>
        {icone ? (
          <Icone nome={icone} tamanho={18} className="text-salvia" />
        ) : null}
      </div>

      <p className="mt-2 font-display text-2xl text-grafite">{valor}</p>

      {variacao ? (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            variacao.positiva ? "text-musgo" : "text-texto-suave",
          )}
        >
          {variacao.texto}
        </p>
      ) : null}
    </div>
  );
}
