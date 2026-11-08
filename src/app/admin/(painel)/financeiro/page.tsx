import { ModulePlaceholder } from "@/components/admin/ModulePlaceholder";

export default function FinanceiroPage() {
  return (
    <ModulePlaceholder
      titulo="Financeiro"
      descricao="Acompanhe entradas, despesas, contas e fluxo de caixa."
      icone="Wallet"
      proximoPasso="Os lançamentos usarão valores inteiros em centavos e serão protegidos para owner e admin."
    />
  );
}
