# Arquitetura

> Leia este arquivo e `docs/BRAND.md` antes de começar qualquer parte.
> Os dois são curtos de propósito: evitam que cada sessão precise reanalisar
> o projeto inteiro.

---

## 1. Pilha

| Item | Escolha | Observação |
| --- | --- | --- |
| Framework | **Next.js 16.4** (App Router, Turbopack) | `cacheComponents` ligado |
| Linguagem | TypeScript (estrito) | — |
| Estilo | **Tailwind CSS v4** | Tokens em `@theme`, dentro de `globals.css` |
| Animação | **motion** (`motion/react`) | Só via `src/lib/motion.ts` |
| Ícones | `lucide-react` | Pelo nome, via `<Icone />` |
| Validação | `zod` | Usado a partir da Parte 5 |
| Imagens | `sharp` (dev) | Só no script de assets de marca |
| Banco / Auth | **Supabase** | A partir da Parte 7. Hoje o site roda sem banco |

### Cache Components

O projeto roda com `cacheComponents: true`. Duas consequências que **vão**
aparecer no seu caminho:

1. Ler valor instável durante a prerenderização (`new Date()`, `Math.random()`,
   cabeçalhos) **quebra o build**. Ou marque a função com `"use cache"`, ou
   coloque o componente dentro de `<Suspense>`, ou mova para o cliente.
   Exemplo real: o ano do rodapé, em `src/components/layout/Footer.tsx`.
2. As funções de leitura de `lib/data` já usam `"use cache"` + `cacheTag`, então
   as seções podem chamá-las direto, sem `Suspense`.

---

## 2. Fluxo de dados

```
src/content/*.ts          conteúdo estático (reserva, e fonte do seed)
        │
        ▼
src/lib/data/index.ts     ÚNICA porta de entrada  ──── "use cache" + cacheTag
        │                 (Parte 7 troca o miolo por Supabase,
        │                  mantendo as MESMAS assinaturas)
        ▼
src/components/sections/  Server Components assíncronos
        │
        ▼
components/ui/*           subcomponentes client (animação, interação)
```

**Regra que não se quebra:** uma seção **nunca** importa `src/content/*`
direto. Só `src/lib/data` faz isso, e só como reserva. Assim o site funciona
igual com e sem banco configurado.

### Funções disponíveis

```ts
getSiteSettings(): Promise<SiteSettings>
getSections(opcoes?: { incluirOcultas?: boolean }): Promise<Section[]>
getSection(id: SectionId): Promise<Section | undefined>
getServices(): Promise<Service[]>
getDifferentials(): Promise<Differential[]>
getProcessSteps(): Promise<ProcessStep[]>
getProjects(opcoes?: { incluirNaoPublicados?: boolean; categoria?: string }): Promise<Project[]>
getProject(slug: string): Promise<Project | undefined>
createLead(entrada: LeadInput): Promise<LeadResult>
```

Os tipos vivem em `src/lib/data/types.ts`. **Mudar um tipo ali quebra outras
partes** — só com acordo explícito, e registrando aqui.

`createLead` **nunca lança exceção**: sempre devolve `{ ok: true }` ou
`{ ok: false, reason }`. Hoje devolve sempre `not_configured`, e a Parte 5
precisa tratar esse caso com uma mensagem honesta e os contatos diretos.

### Cache e revalidação

Tags em `src/lib/data/tags.ts`: `settings`, `sections`, `services`,
`differentials`, `process`, `projects`, mais a guarda-chuva `site`.

Toda leitura marca a sua tag **e** a tag `site`. Quando o painel publicar uma
alteração (Parte 8), basta `revalidateTag(TAGS.projects)` — ou `TAGS.site`
para tudo — e o site público se atualiza.

---

## 3. Mapa de propriedade

Cada parte **só** mexe nos seus arquivos. Precisou de algo fora da sua área?
Registre no relatório final em vez de editar por conta própria.

| Parte | Arquivos |
| --- | --- |
| **0 — Fundação** | base do projeto, `components/ui/*`, `components/brand/*`, `components/mockups/*`, `lib/motion.ts`, `lib/utils.ts`, `lib/data/*` (versão reserva), `scripts/*`, `docs/*`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css` |
| **C — Copy** | `src/content/brand.ts` e os **textos** (só os textos) de `src/content/*.ts` |
| **1 — Header + Hero** | `components/layout/Header.tsx`, `components/sections/Hero.tsx` |
| **2 — Sobre / Diferenciais / Processo** | `components/sections/{Sobre,Diferenciais,Processo}.tsx` |
| **3 — Serviços + CTA** | `components/sections/{Servicos,CTA}.tsx` |
| **4 — Portfólio público** | `components/sections/Portfolio.tsx` |
| **5 — Contato + Footer** | `components/sections/Contato.tsx`, `components/layout/Footer.tsx`, rota de API do formulário |
| **7 — Backend + shell do admin** | `supabase/`, `lib/supabase/*`, `lib/data/*` (implementação real), `middleware.ts`, `app/admin/layout`, `components/admin/*` (UI base), `app/admin/login`, rotas-esqueleto |
| **8 — Site / portfólio no admin** | `app/admin/{site,portfolio,aparencia,midia}/*`, `components/admin/site/*` |
| **9 — Financeiro** | `app/admin/financeiro/*`, `components/admin/finance/*`, `lib/finance/*` |
| **10 — CRM** | `app/admin/{crm,clientes,projetos,tarefas}/*`, `components/admin/crm/*` |
| **11 — Dashboard** | `app/admin/page.tsx`, `components/admin/dashboard/*` |
| **6 — Integração e QA** | SEO, `sitemap.ts`, `robots.ts`, `not-found.tsx`, QA, merge |

---

## 4. Ordem de execução

> **Mudança combinada com o dono (07/11/2026):** o site público vem **antes**
> do painel, para poder publicar na Vercel o quanto antes. A ordem abaixo
> substitui a do adendo.

1. **Parte 0 — Fundação** (sozinha) ✅ concluída
2. **Parte C — Copy** e **Partes 1 a 5** (site público) — até 3 ou 4 chats por vez
3. **Publicar na Vercel** 🚀 — o site já funciona sem banco
4. **Parte 7 — Backend + shell do admin**
5. **Partes 8, 9, 10** (módulos do painel), depois **Parte 11** (dashboard)
6. **Parte 6 — Integração, segurança e QA** (sozinha, por último)

Worktrees sugeridos: `feat/copy`, `feat/hero`, `feat/sobre`, `feat/servicos`,
`feat/portfolio`, `feat/contato`, depois `feat/backend-shell`, `feat/admin-site`,
`feat/admin-financeiro`, `feat/admin-crm`, `feat/admin-dashboard`.

---

## 5. Componentes da fundação

Tudo abaixo já existe. **Reutilize em vez de recriar.**

### Layout e texto

| Componente | Para quê |
| --- | --- |
| `<Container largura="estreito\|padrao\|largo">` | Centraliza e aplica o respiro lateral |
| `<Section id fundo espaco largura semContainer>` | Envelope de seção: fundo, espaçamento, âncora |
| `<SectionHeading sobretitulo titulo descricao alinhamento invertido nivel>` | Cabeçalho padrão de seção |

`fundo` aceita `claro`, `alternado`, `escuro`, `musgo`.
Em `escuro` e `musgo`, passe `invertido` para o `SectionHeading` e use as
variantes de logo para fundo escuro.

### Interação

| Componente | Para quê |
| --- | --- |
| `<Button variante tamanho>` | Botão. `primario`, `secundario`, `fantasma`, `claro` |
| `<BotaoLink href ...>` | Mesma aparência, mas navega |
| `<Card interativo fundo>` | Cartão com borda e elevação no hover |
| `<Icone nome tamanho>` | Ícone lucide pelo nome. `existeIcone()` valida |

### Marca

| Componente | Para quê |
| --- | --- |
| `<Logo variante altura prioridade>` | Lockup. Veja em `BRAND.md` qual variante serve a cada fundo |
| `<ArkaSymbol variante tamanho alt>` | Só o símbolo |

### Mockups

| Componente | Para quê |
| --- | --- |
| `<DeviceFrame dispositivo comBarra>` | Moldura de notebook, tablet ou celular |
| `<MockSite variante>` | Miniatura de site desenhada em CSS, quando o projeto não tem capa |

### Movimento

| Componente | Para quê |
| --- | --- |
| `<Reveal variante delay as className comoLista intervalo>` | Entrada animada ao aparecer na tela |
| `<RevealItem variante as className>` | Filho de um `<Reveal comoLista>` |

⚠️ São **dois exports nomeados**, não um componente composto. `Reveal.Item`
não funcionaria: propriedade estática não atravessa a fronteira
server/client, e as seções são Server Components.

⚠️ `as` só aceita as tags listadas em `COMPONENTES`, dentro de `Reveal.tsx`.
Precisa de outra? Acrescente na lista — nunca gere o componente no render.

---

## 6. Convenções

- **Idioma:** código, componentes e comentários em português (sem acento nos
  comentários, por segurança de encoding). **Todo texto que o usuário lê tem
  acentuação correta.**
- **Dinheiro:** sempre inteiro em centavos (`amount_cents`). Nunca float.
  Formatação em `lib/money.ts` (Parte 7).
- **Datas:** `date-fns` com locale pt-BR (Parte 7).
- **Mutações:** sempre Server Action ou Route Handler que valida sessão, papel
  e dados com zod. Nunca confie no cliente.
- **Imagens:** sempre `next/image`.
- **Acessibilidade:** foco visível, navegação por teclado, `alt` em imagem com
  conteúdo, `aria-hidden` no que é decorativo.

---

## 7. Comandos

```bash
npm run dev            # desenvolvimento
npm run build          # build de produção
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run brand:assets   # regenera logos transparentes, favicons e imagem OG
```

Rode `lint` e `build` no fim de cada bloco de trabalho, não a cada arquivo.

---

## 8. Como criar uma seção nova

1. Crie `src/components/sections/MinhaSecao.tsx` como **Server Component
   assíncrono**.
2. Busque dados **só** por `@/lib/data`.
3. Monte com `<Section>` + `<SectionHeading>` + `<Reveal>`.
4. Acrescente a entrada correspondente em `src/content/sections.ts` (`id`,
   `rotulo`, `ordem`, `visivel`) e o `id` no tipo `SectionId`.
5. Inclua em `src/app/page.tsx`.
6. `npm run lint && npm run build`.

---

## 9. Publicar na Vercel

O site **não depende de banco nem de variável de ambiente** para subir — essa
foi uma decisão de projeto, justamente para poder publicar cedo.

1. `git init` e primeiro commit (já feito).
2. Suba o repositório para o GitHub.
3. Importe o projeto na Vercel. O preset Next.js é detectado sozinho; não há
   variável obrigatória nesta fase.
4. Depois da Parte 7, acrescente as variáveis do Supabase
   (`docs/SETUP-SUPABASE.md`, criado por aquela parte).

Antes de divulgar o endereço, resolva os itens 🔴 de `docs/PENDENCIAS.md` —
hoje o botão de WhatsApp aponta para um número inexistente.
