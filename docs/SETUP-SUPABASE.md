# Configurar o Supabase

Passo a passo para o dono ligar o banco de dados. **Sem isso, o site
continua funcionando** com o conteúdo de `src/content/*` — este passo liga
o painel administrativo e o formulário de contato de verdade.

## 1. Criar o projeto

1. Acesse [supabase.com](https://supabase.com) e crie uma conta (dá para
   entrar com GitHub).
2. **New Project** → escolha um nome (ex.: `arka-technologies`), uma senha
   forte para o banco (guarde-a em um lugar seguro) e a região mais perto do
   Brasil (`South America (São Paulo)`, se disponível).
3. Aguarde alguns minutos até o projeto ficar pronto.

## 2. Rodar as migrações

No painel do Supabase, abra **SQL Editor** → **New query**.

1. Cole e rode cada arquivo de `supabase/migrations/`, em ordem alfabética.
2. Cole o conteúdo de `supabase/seed.sql` e rode — isso preenche serviços,
   diferenciais, etapas, perguntas frequentes e os projetos conceito.

Se `0001_init.sql` já foi aplicado anteriormente, rode também a nova migração
`0002_profiles_role_hardening.sql`. Ela restringe a edição de papéis para
impedir que um usuário altere seu próprio acesso diretamente pela API.

Se o seu Claude Code tiver o CLI do Supabase configurado, também funciona:

```bash
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
psql "$(npx supabase status -o json | jq -r .DB_URL)" -f supabase/seed.sql
```

## 3. Criar o bucket de mídia

**Storage** → **New bucket** → nome `media` → marque **Public bucket**.

## 4. Criar o primeiro usuário (você, como owner)

**Authentication** → **Users** → **Add user** → **Create new user**.
Preencha seu e-mail e uma senha. **O primeiro usuário criado vira `owner`
automaticamente** — é uma regra do banco (veja `criar_perfil_para_novo_usuario`
em `0001_init.sql`). Os próximos usuários nascem como `staff`; a gestão de
papéis pelo painel será adicionada no módulo de configurações. Até lá, não
altere permissões diretamente em produção sem revisar as políticas RLS.

## 5. Preencher as variáveis de ambiente

**Project Settings** → **API**. Copie:

| Variável | Onde está no painel |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project API keys → Publishable key (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Project API keys → `service_role` (⚠️ secreta) |

Em projetos antigos, a chave `anon` também pode ser configurada em
`NEXT_PUBLIC_SUPABASE_ANON_KEY`; ela continua aceita. Nunca coloque uma
secret key (`sb_secret_...`) ou a `service_role` em uma variável
`NEXT_PUBLIC_*`.

Copie `.env.example` para `.env.local` e preencha a Project URL e a
publishable key. Na Vercel, configure os mesmos valores em **Settings →
Environment Variables**. A `SUPABASE_SERVICE_ROLE_KEY` só deve ser criada
no servidor se uma operação administrativa que precise ignorar RLS for
adicionada; o login e o cliente Supabase usam a chave pública com RLS.

Se uma chave secreta foi colocada no `.env.example`, commitada ou enviada
em uma conversa, revogue-a e gere outra em **Settings → API Keys**. Apagar
o valor do arquivo atual não remove cópias em commits antigos.

## 6. Conferir

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

## Avisos de segurança

- **Nunca** commite `.env.local` nem cole a `service_role` key em um chat.
- Toda tabela tem RLS ligada (ver `0001_init.sql`, seção 6). Se uma consulta
  "sumir" sem erro, confira a política antes de desligar o RLS.
- O domínio só é seu de verdade se o registro ficar no seu CPF/CNPJ — não
  no CPF de quem registrou para você.
