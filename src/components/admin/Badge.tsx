import { cn } from "@/lib/utils";

/**
 * Status comuns no painel. Mapeados aqui uma vez para toda a cor de badge
 * ficar consistente entre financeiro, CRM e projetos.
 */
export type StatusBadge =
  | "pendente"
  | "pago"
  | "atrasado"
  | "ativo"
  | "pausado"
  | "concluido"
  | "cancelado"
  | "novo"
  | "neutro";

const ESTILOS: Record<StatusBadge, string> = {
  pendente: "bg-areia text-musgo-escuro",
  pago: "bg-musgo/15 text-musgo-escuro",
  atrasado: "bg-grafite/10 text-grafite",
  ativo: "bg-musgo/15 text-musgo-escuro",
  pausado: "bg-areia text-musgo-escuro",
  concluido: "bg-salvia/20 text-musgo-escuro",
  cancelado: "bg-grafite/8 text-texto-suave",
  novo: "bg-salvia/25 text-musgo-escuro",
  neutro: "bg-areia-claro text-texto-suave",
};

const ROTULOS: Record<StatusBadge, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
  ativo: "Ativo",
  pausado: "Pausado",
  concluido: "Concluído",
  cancelado: "Cancelado",
  novo: "Novo",
  neutro: "—",
};

type BadgeProps = {
  status: StatusBadge;
  /** Sobrescreve o rótulo padrão, mantendo a cor do status. */
  rotulo?: string;
  className?: string;
};

export function Badge({ status, rotulo, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        ESTILOS[status],
        className,
      )}
    >
      {rotulo ?? ROTULOS[status]}
    </span>
  );
}
