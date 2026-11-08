import { ModulePlaceholder } from "@/components/admin/ModulePlaceholder";

export default function MidiaPage() {
  return (
    <ModulePlaceholder
      titulo="Biblioteca de mídia"
      descricao="Encontre e reutilize imagens e arquivos do site."
      icone="Images"
      proximoPasso="A biblioteca será conectada ao Storage com validação de arquivo, texto alternativo e bloqueio para itens em uso."
    />
  );
}
