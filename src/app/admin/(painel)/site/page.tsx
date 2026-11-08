import { ModulePlaceholder } from "@/components/admin/ModulePlaceholder";

export default function ConteudoSitePage() {
  return (
    <ModulePlaceholder
      titulo="Conteúdo do site"
      descricao="Edite os textos e a visibilidade das seções do site."
      icone="FileText"
      proximoPasso="As alterações serão preparadas como rascunho e só entrarão no site depois de publicadas."
    />
  );
}
