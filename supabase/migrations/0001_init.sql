-- =============================================================================
-- ARKA TECHNOLOGIES - schema inicial
-- Parte 7 (backend). Criado em 07/11/2026.
--
-- Principios:
--   1. RLS LIGADA em todas as tabelas, sem excecao.
--   2. Leitura publica SO de conteudo publicado do site.
--   3. Escrita publica SO em leads, e com limites.
--   4. Todo o resto exige usuario autenticado com papel adequado.
--   5. Dinheiro sempre em CENTAVOS INTEIROS (bigint). Nunca float.
--
-- NUNCA edite este arquivo depois de aplicado. Crie uma migracao nova.
-- =============================================================================

create extension if not exists "pgcrypto";

-- =============================================================================
-- 1. PERFIS E PAPEIS
-- =============================================================================

create type papel_usuario as enum ('owner', 'admin', 'staff');

create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text not null default '',
  papel       papel_usuario not null default 'staff',
  criado_em   timestamptz not null default now()
);

comment on table profiles is
  'Um perfil por usuario do Auth. O papel controla o acesso no painel.';

-- Cria o perfil automaticamente quando nasce um usuario no Auth.
-- O PRIMEIRO usuario do sistema vira owner; os demais, staff.
create or replace function criar_perfil_para_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ja_existe_alguem boolean;
begin
  select exists (select 1 from profiles) into ja_existe_alguem;

  insert into profiles (id, nome, papel)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    case when ja_existe_alguem then 'staff'::papel_usuario
         else 'owner'::papel_usuario end
  );

  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function criar_perfil_para_novo_usuario();

-- Helpers de autorizacao.
-- SECURITY DEFINER para nao cair em recursao de RLS ao consultar profiles.
create or replace function esta_autenticado()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from profiles where id = auth.uid());
$$;

create or replace function tem_papel(papeis papel_usuario[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and papel = any (papeis)
  );
$$;

-- Atalho: quem pode administrar conteudo e dinheiro.
create or replace function pode_gerenciar()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select tem_papel(array['owner', 'admin']::papel_usuario[]);
$$;

alter table profiles enable row level security;

create policy "perfil proprio visivel"
  on profiles for select
  using (id = auth.uid() or pode_gerenciar());

create policy "owner e admin editam perfis"
  on profiles for update
  using (pode_gerenciar())
  with check (pode_gerenciar());

-- =============================================================================
-- 2. UTILITARIOS
-- =============================================================================

create or replace function tocar_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

-- =============================================================================
-- 3. CONTEUDO DO SITE
-- =============================================================================

create table site_settings (
  chave          text primary key,
  valor          jsonb not null default '{}'::jsonb,
  atualizado_em  timestamptz not null default now()
);

comment on table site_settings is
  'Configuracoes chave/valor: contatos, redes, SEO, tema e rastreamento de anuncios.';

create trigger site_settings_atualizado
  before update on site_settings
  for each row execute function tocar_atualizado_em();

create table site_sections (
  id             text primary key,
  rotulo         text not null,
  titulo         text not null default '',
  subtitulo      text,
  descricao      text,
  conteudo       jsonb not null default '{}'::jsonb,
  -- Rascunho: edicoes ainda nao publicadas. NULL = nada pendente.
  rascunho       jsonb,
  visivel        boolean not null default true,
  ordem          integer not null default 0,
  publicado_em   timestamptz,
  atualizado_em  timestamptz not null default now()
);

create trigger site_sections_atualizado
  before update on site_sections
  for each row execute function tocar_atualizado_em();

create table services (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  nome           text not null,
  descricao      text not null default '',
  entregas       text[] not null default '{}',
  icone          text not null default 'Circle',
  ordem          integer not null default 0,
  publicado      boolean not null default true,
  atualizado_em  timestamptz not null default now()
);

create trigger services_atualizado
  before update on services
  for each row execute function tocar_atualizado_em();

create table differentials (
  id         uuid primary key default gen_random_uuid(),
  titulo     text not null,
  descricao  text not null default '',
  apoio      text,
  icone      text not null default 'Circle',
  ordem      integer not null default 0
);

create table process_steps (
  id         text primary key,
  numero     integer not null,
  titulo     text not null,
  descricao  text not null default '',
  detalhe    text,
  icone      text not null default 'Circle'
);

comment on table process_steps is
  'As 4 etapas da ARKA. Os ids sao usados por client_projects.etapa.';

create table projects (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  nome           text not null,
  categoria      text not null default '',
  descricao      text not null default '',
  dispositivo    text not null default 'desktop'
                   check (dispositivo in ('desktop', 'tablet', 'mobile')),
  variante       text not null default 'institucional'
                   check (variante in ('institucional', 'loja', 'landing', 'servico')),
  is_concept     boolean not null default true,
  live_url       text,
  cover_url      text,
  cover_alt      text,
  gallery        text[] not null default '{}',
  tags           text[] not null default '{}',
  publicado      boolean not null default false,
  ordem          integer not null default 0,
  atualizado_em  timestamptz not null default now(),

  -- Acessibilidade: se tem capa, tem que ter texto alternativo.
  constraint capa_exige_alt
    check (cover_url is null or coalesce(trim(cover_alt), '') <> '')
);

create trigger projects_atualizado
  before update on projects
  for each row execute function tocar_atualizado_em();

-- Perguntas frequentes. Pedido do dono: gerenciaveis pelo painel.
create table faq (
  id         uuid primary key default gen_random_uuid(),
  pergunta   text not null,
  resposta   text not null,
  ordem      integer not null default 0,
  publicado  boolean not null default true
);

-- ANUNCIOS (Google Ads)
-- O dono quer veicular Google Ads. Isso nao e uma tabela de conteudo: sao
-- identificadores de rastreamento, que moram em site_settings sob a chave
-- 'rastreamento'. Formato do valor jsonb:
--
--   {
--     "google_ads_id":        "AW-XXXXXXXXXX",
--     "google_ads_conversao": "AW-XXXXXXXXXX/abcDEFghiJKL",
--     "google_analytics_id":  "G-XXXXXXXXXX",
--     "gtm_id":               "GTM-XXXXXXX",
--     "ativo":                true
--   }
--
-- O site le isso por getTracking() e so injeta os scripts quando ha ID
-- configurado. A Parte 8 expoe esses campos na tela de configuracoes.

create table media (
  id          uuid primary key default gen_random_uuid(),
  caminho     text not null unique,
  url         text not null,
  tipo        text not null default '',
  tamanho     bigint not null default 0,
  largura     integer,
  altura      integer,
  alt         text not null default '',
  criado_por  uuid references profiles (id) on delete set null,
  criado_em   timestamptz not null default now()
);

-- =============================================================================
-- 4. CRM
-- =============================================================================

create table leads (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  email         text not null,
  empresa       text,
  telefone      text,
  tipo_projeto  text,
  mensagem      text not null default '',
  origem        text not null default 'site',
  status        text not null default 'novo'
                  check (status in ('novo', 'em_contato', 'qualificado', 'convertido', 'descartado')),
  criado_em     timestamptz not null default now(),

  -- Limites contra abuso do formulario publico.
  constraint nome_tamanho     check (char_length(nome) between 2 and 120),
  constraint email_tamanho    check (char_length(email) between 5 and 200),
  constraint email_formato    check (position('@' in email) > 1),
  constraint mensagem_tamanho check (char_length(mensagem) <= 5000)
);

create index leads_criado_em_idx on leads (criado_em desc);

create table clients (
  id             uuid primary key default gen_random_uuid(),
  empresa        text not null,
  responsavel    text,
  email          text,
  telefone       text,
  documento      text,
  endereco       text,
  tags           text[] not null default '{}',
  observacoes    text,
  lead_id        uuid references leads (id) on delete set null,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

create trigger clients_atualizado
  before update on clients
  for each row execute function tocar_atualizado_em();

create table client_contacts (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references clients (id) on delete cascade,
  nome       text not null,
  cargo      text,
  email      text,
  telefone   text,
  principal  boolean not null default false
);

create table interactions (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references clients (id) on delete cascade,
  lead_id     uuid references leads (id) on delete cascade,
  tipo        text not null default 'nota'
                check (tipo in ('ligacao', 'whatsapp', 'reuniao', 'email', 'nota')),
  descricao   text not null default '',
  ocorreu_em  timestamptz not null default now(),
  criado_por  uuid references profiles (id) on delete set null,

  constraint tem_dono check (client_id is not null or lead_id is not null)
);

create index interactions_client_idx on interactions (client_id, ocorreu_em desc);

create table deals (
  id              uuid primary key default gen_random_uuid(),
  titulo          text not null,
  client_id       uuid references clients (id) on delete set null,
  lead_id         uuid references leads (id) on delete set null,
  etapa           text not null default 'novo'
                    check (etapa in ('novo', 'contato_feito', 'proposta_enviada',
                                     'negociacao', 'ganho', 'perdido')),
  valor_cents     bigint not null default 0 check (valor_cents >= 0),
  motivo_perda    text,
  ordem           integer not null default 0,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);

create trigger deals_atualizado
  before update on deals
  for each row execute function tocar_atualizado_em();

create table client_projects (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references clients (id) on delete cascade,
  service_id    uuid references services (id) on delete set null,
  nome          text not null,
  -- Espelha process_steps.id: conversa | planejamento | desenvolvimento | entrega
  etapa         text not null default 'conversa' references process_steps (id),
  status        text not null default 'ativo'
                  check (status in ('ativo', 'pausado', 'concluido', 'cancelado')),
  valor_cents   bigint not null default 0 check (valor_cents >= 0),
  prazo         date,
  responsavel   uuid references profiles (id) on delete set null,
  checklist     jsonb not null default '[]'::jsonb,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create trigger client_projects_atualizado
  before update on client_projects
  for each row execute function tocar_atualizado_em();

create table tasks (
  id                 uuid primary key default gen_random_uuid(),
  titulo             text not null,
  descricao          text,
  vence_em           date,
  prioridade         text not null default 'media'
                       check (prioridade in ('baixa', 'media', 'alta')),
  concluida          boolean not null default false,
  concluida_em       timestamptz,
  client_id          uuid references clients (id) on delete cascade,
  lead_id            uuid references leads (id) on delete cascade,
  client_project_id  uuid references client_projects (id) on delete cascade,
  responsavel        uuid references profiles (id) on delete set null,
  criado_em          timestamptz not null default now()
);

create index tasks_vence_em_idx on tasks (vence_em) where not concluida;

-- =============================================================================
-- 5. FINANCEIRO  (tudo em centavos inteiros)
-- =============================================================================

create table finance_accounts (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null unique,
  tipo           text not null default 'banco'
                   check (tipo in ('banco', 'caixa', 'carteira_digital')),
  saldo_inicial_cents bigint not null default 0,
  cor            text,
  ativo          boolean not null default true,
  ordem          integer not null default 0
);

create table finance_categories (
  id     uuid primary key default gen_random_uuid(),
  nome   text not null,
  -- unica por tipo: 'Outras receitas' e 'Outras despesas' podem coexistir
  unique (nome, tipo),
  tipo   text not null check (tipo in ('in', 'out')),
  cor    text,
  ordem  integer not null default 0
);

create table transactions (
  id               uuid primary key default gen_random_uuid(),
  tipo             text not null check (tipo in ('in', 'out')),
  descricao        text not null,
  -- SEMPRE centavos inteiros. Nunca numeric, nunca float.
  amount_cents     bigint not null check (amount_cents > 0),
  competencia      date not null default current_date,
  vencimento       date,
  pago_em          date,
  status           text not null default 'pending'
                     check (status in ('pending', 'paid', 'overdue')),
  account_id       uuid references finance_accounts (id) on delete set null,
  category_id      uuid references finance_categories (id) on delete set null,
  client_id        uuid references clients (id) on delete set null,
  client_project_id uuid references client_projects (id) on delete set null,
  -- Transferencia entre contas: a contraparte do lancamento.
  transfer_par_id  uuid references transactions (id) on delete set null,
  recorrencia      text check (recorrencia in ('mensal', 'anual')),
  recorrencia_ate  date,
  parcela_num      integer,
  parcela_total    integer,
  observacoes      text,
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now(),

  constraint pago_tem_data  check (status <> 'paid' or pago_em is not null),
  constraint parcela_coerente
    check ((parcela_num is null) = (parcela_total is null))
);

create trigger transactions_atualizado
  before update on transactions
  for each row execute function tocar_atualizado_em();

create index transactions_competencia_idx on transactions (competencia desc);
create index transactions_status_idx on transactions (status, vencimento);

-- =============================================================================
-- 6. ROW LEVEL SECURITY
-- =============================================================================

alter table site_settings     enable row level security;
alter table site_sections     enable row level security;
alter table services          enable row level security;
alter table differentials     enable row level security;
alter table process_steps     enable row level security;
alter table projects          enable row level security;
alter table faq               enable row level security;
alter table media             enable row level security;
alter table leads             enable row level security;
alter table clients           enable row level security;
alter table client_contacts   enable row level security;
alter table interactions      enable row level security;
alter table deals             enable row level security;
alter table client_projects   enable row level security;
alter table tasks             enable row level security;
alter table finance_accounts  enable row level security;
alter table finance_categories enable row level security;
alter table transactions      enable row level security;

-- ---------------------------------------------------------------------------
-- 6.1 Leitura publica: SO conteudo publicado do site.
-- ---------------------------------------------------------------------------

create policy "publico le configuracoes"
  on site_settings for select using (true);

create policy "publico le secoes visiveis"
  on site_sections for select using (visivel);

create policy "publico le servicos publicados"
  on services for select using (publicado);

create policy "publico le diferenciais"
  on differentials for select using (true);

create policy "publico le etapas"
  on process_steps for select using (true);

create policy "publico le projetos publicados"
  on projects for select using (publicado);

create policy "publico le faq publicada"
  on faq for select using (publicado);

create policy "publico le midia"
  on media for select using (true);

-- ---------------------------------------------------------------------------
-- 6.2 Escrita publica: SO inserir lead. Nunca ler, atualizar ou apagar.
-- ---------------------------------------------------------------------------

create policy "publico envia lead"
  on leads for insert
  with check (origem = 'site');

-- ---------------------------------------------------------------------------
-- 6.3 Equipe: acesso completo ao conteudo do site.
-- ---------------------------------------------------------------------------

create policy "equipe gerencia configuracoes" on site_settings for all
  using (pode_gerenciar()) with check (pode_gerenciar());
create policy "equipe gerencia secoes" on site_sections for all
  using (pode_gerenciar()) with check (pode_gerenciar());
create policy "equipe gerencia servicos" on services for all
  using (pode_gerenciar()) with check (pode_gerenciar());
create policy "equipe gerencia diferenciais" on differentials for all
  using (pode_gerenciar()) with check (pode_gerenciar());
create policy "equipe gerencia etapas" on process_steps for all
  using (pode_gerenciar()) with check (pode_gerenciar());
create policy "equipe gerencia projetos" on projects for all
  using (pode_gerenciar()) with check (pode_gerenciar());
create policy "equipe gerencia faq" on faq for all
  using (pode_gerenciar()) with check (pode_gerenciar());
create policy "equipe gerencia midia" on media for all
  using (esta_autenticado()) with check (esta_autenticado());

-- ---------------------------------------------------------------------------
-- 6.4 CRM e financeiro: qualquer usuario autenticado da equipe.
-- ---------------------------------------------------------------------------

create policy "equipe gerencia leads" on leads for all
  using (esta_autenticado()) with check (esta_autenticado());
create policy "equipe gerencia clientes" on clients for all
  using (esta_autenticado()) with check (esta_autenticado());
create policy "equipe gerencia contatos" on client_contacts for all
  using (esta_autenticado()) with check (esta_autenticado());
create policy "equipe gerencia interacoes" on interactions for all
  using (esta_autenticado()) with check (esta_autenticado());
create policy "equipe gerencia negocios" on deals for all
  using (esta_autenticado()) with check (esta_autenticado());
create policy "equipe gerencia projetos de cliente" on client_projects for all
  using (esta_autenticado()) with check (esta_autenticado());
create policy "equipe gerencia tarefas" on tasks for all
  using (esta_autenticado()) with check (esta_autenticado());

-- Financeiro e mais sensivel: so owner e admin.
create policy "gestores gerenciam contas" on finance_accounts for all
  using (pode_gerenciar()) with check (pode_gerenciar());
create policy "gestores gerenciam categorias" on finance_categories for all
  using (pode_gerenciar()) with check (pode_gerenciar());
create policy "gestores gerenciam lancamentos" on transactions for all
  using (pode_gerenciar()) with check (pode_gerenciar());
