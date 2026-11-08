import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";

export function ModulePlaceholder({
  titulo,
  descricao,
  icone,
  proximoPasso,
}: {
  titulo: string;
  descricao: string;
  icone: string;
  proximoPasso: string;
}) {
  return (
    <>
      <PageHeader titulo={titulo} descricao={descricao} />
      <EmptyState
        icone={icone}
        titulo="Módulo pronto para conectar"
        descricao={proximoPasso}
      />
    </>
  );
}
