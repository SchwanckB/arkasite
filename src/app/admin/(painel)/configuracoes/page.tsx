import { ModulePlaceholder } from "@/components/admin/ModulePlaceholder";

export default function ConfiguracoesPage() {
  return (
    <ModulePlaceholder
      titulo="Configurações"
      descricao="Gerencie dados da empresa e os acessos da equipe."
      icone="Settings"
      proximoPasso="A criação de usuários permanece desativada no site; os usuários são cadastrados pelo owner no Supabase."
    />
  );
}
