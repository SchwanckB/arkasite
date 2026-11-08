export type ResumoFinanceiro = {
  account_id: string | null;
  tipo: "in" | "out";
  status: "pending" | "paid" | "overdue";
  total_cents: number | string;
};
