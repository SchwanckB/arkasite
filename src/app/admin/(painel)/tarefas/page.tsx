import { ModulePlaceholder } from "@/components/admin/ModulePlaceholder";

export default function TarefasPage() {
  return (
    <ModulePlaceholder
      titulo="Tarefas e follow-ups"
      descricao="Organize retornos e próximos passos sem perder prazos."
      icone="ListChecks"
      proximoPasso="Aqui ficarão as tarefas de hoje, atrasadas e previstas para os próximos sete dias."
    />
  );
}
