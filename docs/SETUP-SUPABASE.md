# Configurar o Supabase

Passo a passo para o dono ligar o banco de dados. **Sem isso, o site
continua funcionando** com o conteúdo de `src/content/*` — este passo liga
o painel administrativo e o formulário de contato de verdade.

## 1. Projeto Supabase

Se já existe um projeto integrado à Vercel, use esse mesmo projeto. Confirme
que o repositório, preview e produção apontam para o Supabase correto. Não
crie outro projeto só para habilitar o painel.

## 2. Rodar as migrações e popular os dados iniciais

No painel do Supabase, abra **SQL Editor** → **New query**.

1. Cole e execute, em ordem, as migrações que ainda não foram aplicadas:
   `0001_init.sql`, `0002_profiles_role_hardening.sql`,
   `0003_admin_modules.sql` e `0004_crm_management.sql`.
2. Execute o conteúdo atualizado de `supabase/seed.sql`. Ele preenche as
   seções, serviços, diferenciais, etapas, perguntas frequentes, configurações
   públicas e projetos-conceito. Conflitos preservam os dados já editados no
   painel; o seed pode ser executado novamente.

Se `0001_init.sql` já foi aplicado anteriormente, rode também a nova migração
`0002_profiles_role_hardening.sql`. Ela restringe a edição de papéis para
impedir que um usuário altere seu próprio acesso diretamente pela API.
Para ativar os módulos, aplique também `0003_admin_modules.sql`; ela habilita
o bucket `media`, suas políticas de acesso, a edição de papéis pelo owner e
índices para evitar duplicar perguntas e diferenciais ao executar o seed.
Para ativar responsáveis, ações em lote, indicadores por período e histórico
de alterações no CRM, aplique também `0004_crm_management.sql`. Ela adiciona
responsáveis a leads e oportunidades, permite que a equipe autenticada consulte
os nomes do time e registra mudanças comerciais na tabela `crm_activity`.

Se o CLI do Supabase estiver configurado, também funciona:

```bash
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
psql "$(npx supabase status -o json | jq -r .DB_URL)" -f supabase/seed.sql
```

## 3. Criar o primeiro usuário (você, como owner)

**Authentication** → **Users** → **Add user** → **Create new user**.
Preencha seu e-mail e uma senha. **O primeiro usuário criado vira `owner`
automaticamente** — é uma regra do banco (veja `criar_perfil_para_novo_usuario`
em `0001_init.sql`). Os próximos usuários nascem como `staff`; a gestão de
papéis pode ser feita pelo owner em **Admin → Configurações**. O owner pode
atribuir `admin` ou `staff`; não é possível transferir o papel `owner` pelo
painel. Cadastros de usuários continuam sendo feitos aqui no Supabase, sem
formulário público de criação de conta.

## 4. Preencher as variáveis de ambiente

**Project Settings** → **API**. Copie:

| Variável | Onde está no painel |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project API keys → Publishable key (`sb_publishable_...`) |
Em projetos antigos, a chave `anon` também pode ser configurada em
`NEXT_PUBLIC_SUPABASE_ANON_KEY`; ela continua aceita. Nunca coloque uma
secret key (`sb_secret_...`) ou a `service_role` em uma variável
`NEXT_PUBLIC_*`. O painel usa a chave pública com RLS e não precisa da
`service_role`.

Copie `.env.example` para `.env.local` e preencha a Project URL e a
publishable key. Na Vercel, configure os mesmos valores em **Settings →
Environment Variables** com estes nomes exatos. Escolha os ambientes usados
(Production, Preview e Development) e faça um novo deploy para aplicar as
variáveis. A integração da Vercel pode criar outras variáveis, como
`SUPABASE_URL`; elas não substituem automaticamente `NEXT_PUBLIC_SUPABASE_URL`.

Se uma chave secreta foi colocada no `.env.example`, commitada ou enviada
em uma conversa, revogue-a e gere outra em **Settings → API Keys**. Apagar
o valor do arquivo atual não remove cópias em commits antigos.

## 5. Conferir

```bash
npm run dev
```

Abra `/admin`. Com o Supabase configurado, entre com o e-mail e senha do
primeiro usuário. Se as variáveis ainda não estiverem disponíveis, o painel
explica como conectá-las. Não existe cadastro público.

O primeiro acesso cria a conta pelo fluxo do Supabase em
**Authentication → Users → Add user**. Depois do login, as rotas do painel
exigem um perfil válido em `profiles`; a sessão é validada pelo Supabase no
middleware e novamente no servidor antes de renderizar o painel.

Os módulos gravam diretamente nas tabelas definidas por `0001_init.sql`.
O site público lê as configurações e o conteúdo publicado do banco. Edições
de seções precisam ser salvas como rascunho e então publicadas. Projetos reais
do portfólio exigem autorização por escrito do cliente. O módulo financeiro
é um registro interno: não conecta a bancos nem processa pagamentos.

### Fluxo comercial e financeiro

1. Registre contatos recebidos pelo site ou cadastre um lead em
   **Admin → Funil**. Use busca, status e origem para organizar o atendimento;
   a exportação CSV baixa os leads disponíveis no cadastro, somente para
   usuários autenticados do painel.
2. Crie uma oportunidade vinculada ao lead ou a um cliente e mova-a pelas
   etapas do funil. Os valores do funil são estimativas comerciais, não
   representam dinheiro recebido.
3. Registre cada ligação, mensagem, reunião ou nota no histórico do lead e
   agende o retorno como tarefa. O follow-up também aparece em **Tarefas** e
   no dashboard quando estiver vencido ou marcado para hoje.
4. Quando o lead se tornar cliente, use **Converter em cliente**. Cadastre o
   projeto contratado em **Projetos** e vincule tarefas a leads, clientes e
   projetos para acompanhar a execução.
5. Em **Financeiro**, registre recebimentos e despesas reais, associando cada
   lançamento ao cliente e, se aplicável, ao projeto. A seleção de um projeto
   preenche também seu cliente. Marque o lançamento como pago somente quando
   o recebimento ou pagamento tiver ocorrido.
6. No CRM, atribua leads e oportunidades a alguém da equipe. Use os filtros
   combinados e as ações em lote para atualizar contatos; a exportação CSV
   respeita os filtros ativos. O desempenho por origem e etapa pode ser
   consultado nos períodos disponíveis.
7. Em follow-ups com prazo, use **Calendário** para baixar um arquivo `.ics`
   e importá-lo no calendário da equipe. A exportação é autenticada e cria um
   evento de dia inteiro; ela não sincroniza alterações futuras
   automaticamente com Google Calendar ou Outlook.

O dashboard do CRM considera até 300 leads e oportunidades mais recentes para
os cartões e o funil. A exportação e o registro contábil não substituem
conciliação bancária, emissão fiscal, contratos ou acompanhamento profissional.

## 6. Google Search Console e descoberta

1. Confirme em **Admin → Configurações → Dados da empresa** que a URL é o
   domínio público canônico, com HTTPS. Use o mesmo domínio configurado na
   Vercel.
2. No [Google Search Console](https://search.google.com/search-console),
   adicione uma propriedade de domínio e siga a verificação DNS indicada pelo
   Google no provedor que controla o domínio. Não invente nem reutilize tokens.
   Se preferir a verificação por meta tag, copie somente o valor de `content`
   da tag fornecida e salve em **Admin → Configurações → SEO e compartilhamento
   → Verificação do Google Search Console**.
3. Envie `https://SEU-DOMINIO/sitemap.xml` em **Sitemaps** e use a inspeção de
   URL para pedir indexação da página inicial. O site é uma landing page única;
   suas seções com âncoras não são URLs independentes no sitemap.
4. Confira `/robots.txt` e os relatórios de indexação e experiência no Search
   Console depois que o domínio estiver publicado. O sitemap ajuda o Google a
   descobrir a página, mas não garante posição nem prazo de indexação.
5. Se o negócio for elegível para um Perfil da Empresa no Google, crie ou
   reivindique o perfil na conta do proprietário e preencha apenas dados
   comerciais reais. Não use endereço, avaliações ou área de atendimento
   fictícios.

O site gera metadados canônicos, Open Graph/Twitter e dados estruturados
`Organization`/`WebSite` a partir das configurações públicas. Título, descrição
e imagem de compartilhamento podem ser editados no admin. Configure GA4, Google
Ads e Tag Manager somente com os IDs fornecidos por essas contas em **Google
Analytics, Ads e Tag Manager**; o rastreamento mede visitas/campanhas e não
substitui conteúdo útil, acessibilidade, velocidade ou uma estratégia de busca.

## Avisos de segurança

- **Nunca** commite `.env.local` nem cole a `service_role` key em um chat.
- Toda tabela tem RLS ligada (ver `0001_init.sql`, seção 6). Se uma consulta
  "sumir" sem erro, confira a política antes de desligar o RLS.
- O domínio só é seu de verdade se o registro ficar no seu CPF/CNPJ — não
  no CPF de quem registrou para você.
