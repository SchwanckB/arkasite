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

1. Cole o conteúdo de `supabase/migrations/0001_init.sql` e rode.
2. Cole o conteúdo de `supabase/seed.sql` e rode — isso preenche serviços,
   diferenciais, etapas, perguntas frequentes e os projetos conceito.

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
em `0001_init.sql`). Os próximos usuários nascem como `staff` e um `owner`
precisa promovê-los pelo painel.

## 5. Preencher as variáveis de ambiente

**Project Settings** → **API**. Copie:

| Variável | Onde está no painel |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project API keys → `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Project API keys → `service_role` (⚠️ secreta) |

Copie `.env.example` para `.env.local` e preencha essas três. Na Vercel,
acrescente as mesmas três em **Settings → Environment Variables** do projeto
(a `SUPABASE_SERVICE_ROLE_KEY` nunca é exposta ao navegador, mas precisa
existir no servidor).

## 6. Conferir

```bash
npm run dev
```

Abra `/admin` — deve aparecer a tela de login em vez da tela de
"configuração pendente". Entre com o e-mail e senha do passo 4.

## Avisos de segurança

- **Nunca** commite `.env.local` nem cole a `service_role` key em um chat.
- Toda tabela tem RLS ligada (ver `0001_init.sql`, seção 6). Se uma consulta
  "sumir" sem erro, confira a política antes de desligar o RLS.
- O domínio só é seu de verdade se o registro ficar no seu CPF/CNPJ — não
  no CPF de quem registrou para você.
