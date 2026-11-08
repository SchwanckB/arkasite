-- =============================================================================
-- ARKA TECHNOLOGIES - dados iniciais
--
-- Popula site_sections, services, differentials, process_steps, projects, faq e
-- site_settings a partir do conteudo escrito nas Partes C e 0
-- (src/content/*.ts). Rode depois de 0001_init.sql.
--
-- Rode apos as migracoes. Idempotente e preserva alteracoes ja feitas no painel.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- site_settings
-- -----------------------------------------------------------------------------

insert into site_settings (chave, valor) values
  ('geral', jsonb_build_object(
    'nome', 'ARKA Technologies',
    'tagline', 'Tecnologia que conecta sua marca ao futuro.',
    'descricao', 'Estúdio de tecnologia especializado em presença digital. Criamos sites que abrem rápido, funcionam em qualquer tela e dão resultado.',
    'url', 'https://arkatechnologies.com.br'
  )),
  ('contato', jsonb_build_object(
    'email', 'contato@arkatechnologies.com.br',
    'whatsapp', '(51) 99513-9984',
    'whatsapp_digitos', '5551995139984',
    'cidade', 'Brasil'
  )),
  ('redes', jsonb_build_object(
    'instagram', 'https://instagram.com/technologiesarka'
  )),
  ('seo', jsonb_build_object(
    'titulo', 'ARKA Technologies | Sites modernos que geram resultado',
    'descricao', 'Criamos sites institucionais, lojas virtuais e landing pages sob medida. Design atual, carregamento rápido e suporte de quem construiu.',
    'imagem_og', '/og-image.png'
  )),
  ('rastreamento', jsonb_build_object(
    -- Vazio de proposito: ver NEXT_PUBLIC_GOOGLE_ADS_ID em .env.example.
    -- getTracking() cai para a variavel de ambiente quando isto e null.
    'google_ads_id', null,
    'google_ads_conversao', null,
    'google_analytics_id', null,
    'gtm_id', null,
    'ativo', true
  ))
on conflict (chave) do nothing;

-- -----------------------------------------------------------------------------
-- services  (src/content/services.ts)
-- -----------------------------------------------------------------------------

insert into services (slug, nome, descricao, entregas, icone, ordem, publicado) values
  ('site-institucional', 'Site institucional',
   'A presença oficial da sua empresa na internet, com as informações que o cliente procura e um visual à altura da marca. Você recebe um site completo, pronto para ser encontrado no Google e fácil de atualizar sozinho.',
   array['Até 6 páginas', 'Formulário de contato', 'Otimização para busca', 'Painel para editar textos'],
   'Globe', 1, true),
  ('loja-virtual', 'Loja virtual',
   'Uma loja para vender online de verdade, com catálogo organizado e caminho curto até a compra. Você recebe o controle de produtos, estoque e pedidos em um painel só.',
   array['Catálogo de produtos', 'Pagamento online', 'Cálculo de frete', 'Painel de pedidos'],
   'ShoppingBag', 2, true),
  ('landing-page', 'Landing page',
   'Uma página única e direta, feita para transformar visita em contato. Você recebe uma peça pronta para campanha, com medição de resultado desde o primeiro dia.',
   array['Página de alta conversão', 'Integração com WhatsApp', 'Medição de resultados', 'Pronta para anúncios'],
   'Target', 3, true),
  ('sistemas-sob-medida', 'Sistemas sob medida',
   'Painel, área do cliente ou automação construída para o jeito que a sua empresa trabalha. Você recebe uma ferramenta que elimina planilha e retrabalho, com acesso separado por pessoa.',
   array['Levantamento de requisitos', 'Painel administrativo', 'Acesso por usuário', 'Treinamento de uso'],
   'LayoutDashboard', 4, true),
  ('manutencao-e-suporte', 'Manutenção e suporte',
   'Seu site sempre no ar, atualizado e seguro, com alguém por perto quando precisar. Você recebe acompanhamento contínuo e pequenas alterações sem precisar abrir um novo projeto.',
   array['Atualizações e backups', 'Pequenos ajustes', 'Monitoramento', 'Canal direto de suporte'],
   'Wrench', 5, true)
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- differentials  (src/content/differentials.ts)
-- -----------------------------------------------------------------------------

insert into differentials (titulo, descricao, apoio, icone, ordem) values
  ('Sites modernos', 'Design atual e funcional para a sua empresa.',
   'Layout pensado para o seu público, não um tema pronto adaptado às pressas.', 'Monitor', 1),
  ('Responsivos', 'Perfeito em qualquer dispositivo.',
   'Testamos de verdade em celular, tablet e computador antes de publicar.', 'Smartphone', 2),
  ('Focados em resultados', 'Mais visibilidade, mais clientes, mais crescimento.',
   'Cada página tem um objetivo claro: receber uma ligação, um orçamento ou uma compra.', 'TrendingUp', 3),
  ('Suporte dedicado', 'Atendimento próximo e soluções sob medida.',
   'Depois da entrega, você continua falando com quem construiu o seu site.', 'Headset', 4)
on conflict (titulo) do nothing;

-- -----------------------------------------------------------------------------
-- process_steps  (src/content/process.ts)
-- -----------------------------------------------------------------------------

insert into process_steps (id, numero, titulo, descricao, detalhe, icone) values
  ('conversa', 1, 'Conversa',
   'Entendemos o seu negócio, o público e o objetivo do projeto.',
   'Uma conversa sem compromisso para alinhar expectativa, prazo e orçamento.', 'MessageCircle'),
  ('planejamento', 2, 'Planejamento',
   'Definimos a estrutura, o conteúdo e a direção visual do site.',
   'Você aprova o mapa de páginas e o rascunho visual antes de escrevermos código.', 'PenTool'),
  ('desenvolvimento', 3, 'Desenvolvimento',
   'Construímos o site com atenção à performance e aos detalhes.',
   'Acompanhamento por um ambiente de testes, com ajustes durante o caminho.', 'Code'),
  ('entrega', 4, 'Entrega',
   'Publicamos, testamos em todos os aparelhos e seguimos por perto.',
   'Treinamento de uso, ajustes finais e suporte após a publicação.', 'Rocket')
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- faq  (src/content/brand.ts)
-- -----------------------------------------------------------------------------

insert into faq (pergunta, resposta, ordem, publicado) values
  ('Quanto tempo leva para o site ficar pronto?',
   'Depende do tamanho. Uma landing page costuma levar de 2 a 3 semanas; um site institucional, de 4 a 6 semanas; uma loja virtual, um pouco mais. O prazo exato sai na proposta, depois da primeira conversa, e vale como combinado.', 1, true),
  ('O que eu preciso ter em mãos para começar?',
   'Menos do que você imagina. Basta saber o que o seu negócio faz e para quem. Textos, fotos e logo ajudam a acelerar, mas se você não tiver, a gente organiza isso junto na etapa de planejamento.', 2, true),
  ('Vocês cuidam do domínio e da hospedagem?',
   'Sim. Cuidamos da configuração do domínio e da publicação do site. O domínio fica registrado no seu nome — ele é seu, não nosso. Os custos de registro e hospedagem são cobrados à parte, direto do fornecedor, sem intermediação.', 3, true),
  ('Consigo editar o site sozinho depois?',
   'Sim. Entregamos um painel administrativo simples, em português, para você trocar textos, imagens e projetos sem depender de ninguém. Na entrega mostramos como usar.', 4, true),
  ('E depois que o site está no ar?',
   'A gente não some. Há um período de acompanhamento incluído para ajustes finais, e existe a opção de um plano mensal de manutenção com atualizações, backups e pequenas alterações. Você escolhe se faz sentido.', 5, true),
  ('Como funciona o pagamento?',
   'Normalmente em duas partes: metade para iniciar o projeto e metade na entrega. Para projetos maiores dá para parcelar em mais vezes. Tudo combinado por escrito antes de começar, sem cobrança surpresa.', 6, true),
  ('Meu site atual está velho. Dá para aproveitar alguma coisa?',
   'Quase sempre dá. Textos, fotos e o endereço na internet costumam ser aproveitados, e tomamos cuidado para o seu site não perder posição no Google na troca. O que não se aproveita é o que estava atrapalhando.', 7, true),
  ('Vocês atendem clientes de outras cidades?',
   'Sim. Todo o processo funciona bem à distância, por videochamada e WhatsApp. Você acompanha o projeto por um endereço de testes desde as primeiras semanas.', 8, true)
on conflict (pergunta) do nothing;

-- -----------------------------------------------------------------------------
-- projects  (src/content/projects.ts) - todos marcados como conceito
-- -----------------------------------------------------------------------------

insert into projects (slug, nome, categoria, descricao, dispositivo, variante, is_concept, tags, publicado, ordem) values
  ('bistro-conceito', 'Bistrô', 'Gastronomia',
   'Site de restaurante com cardápio, reservas e localização, pensado para quem acessa do celular na rua.',
   'mobile', 'institucional', true, array['Institucional', 'Cardápio', 'Reservas'], true, 1),
  ('atelie-conceito', 'Ateliê', 'Moda',
   'Loja virtual enxuta para uma marca autoral, com catálogo visual e checkout curto.',
   'desktop', 'loja', true, array['Loja virtual', 'Catálogo'], true, 2),
  ('clinica-conceito', 'Clínica', 'Saúde',
   'Site de clínica com especialidades, equipe e agendamento direto pelo WhatsApp.',
   'desktop', 'servico', true, array['Institucional', 'Agendamento'], true, 3),
  ('construtora-conceito', 'Construtora', 'Construção',
   'Apresentação de empreendimentos com galeria, plantas e formulário de interesse.',
   'desktop', 'institucional', true, array['Institucional', 'Galeria'], true, 4),
  ('curso-conceito', 'Curso online', 'Educação',
   'Landing page de lançamento com módulos, depoimentos e inscrição em uma tela.',
   'tablet', 'landing', true, array['Landing page', 'Conversão'], true, 5),
  ('petshop-conceito', 'Pet shop', 'Serviços',
   'Site de bairro com serviços, preços e botão de agendamento sempre visível.',
   'mobile', 'servico', true, array['Serviços', 'Agendamento'], true, 6),
  ('imobiliaria-conceito', 'Imobiliária', 'Imóveis',
   'Demonstração de uma vitrine imobiliária com busca de imóveis, fichas detalhadas e contato rápido com a equipe.',
   'desktop', 'institucional', true, array['Imóveis', 'Busca', 'Captação'], true, 7),
  ('arquitetura-conceito', 'Estúdio de arquitetura', 'Arquitetura',
   'Demonstração de um portfólio visual para apresentar projetos, processo criativo e formas de iniciar uma conversa.',
   'tablet', 'servico', true, array['Portfólio', 'Projetos', 'Contato'], true, 8),
  ('consultoria-conceito', 'Consultoria', 'Negócios',
   'Demonstração de uma landing page para explicar um serviço especializado e gerar pedidos de conversa.',
   'mobile', 'landing', true, array['Landing page', 'Serviços', 'Conversão'], true, 9)
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- finance_accounts e finance_categories - minimo para o modulo abrir usavel
-- -----------------------------------------------------------------------------

insert into finance_accounts (nome, tipo, cor, ordem) values
  ('Conta principal', 'banco', '#4E5A46', 1),
  ('Caixa', 'caixa', '#7D8B79', 2)
on conflict (nome) do nothing;

insert into finance_categories (nome, tipo, cor, ordem) values
  ('Serviços prestados', 'in', '#4E5A46', 1),
  ('Outras receitas', 'in', '#7D8B79', 2),
  ('Ferramentas e assinaturas', 'out', '#DAD2C2', 1),
  ('Impostos', 'out', '#DAD2C2', 2),
  ('Outras despesas', 'out', '#DAD2C2', 3)
on conflict (nome, tipo) do nothing;

-- -----------------------------------------------------------------------------
-- site_sections - textos publicados por secao (os rascunhos sao do painel)
-- -----------------------------------------------------------------------------

insert into site_sections
  (id, rotulo, titulo, subtitulo, descricao, conteudo, visivel, ordem)
values
  ('hero', 'Início', 'Soluções digitais para impulsionar seu comércio',
   'Tecnologia que conecta sua marca ao futuro.',
   'Sites modernos, rápidos e feitos sob medida para o seu negócio aparecer e vender mais.',
   '{"botaoPrimario":"Falar com especialista","botaoSecundario":"Ver portfólio"}'::jsonb, true, 1),
  ('sobre', 'Sobre', 'Sobre a ARKA', 'Quem constrói o seu projeto',
   'Somos um estúdio de tecnologia focado em presença digital. Unimos design cuidadoso e código bem feito para entregar sites que funcionam bem e envelhecem bem.',
   '{}'::jsonb, true, 2),
  ('diferenciais', 'Diferenciais', 'Por que a ARKA', 'O que você encontra aqui',
   null, '{}'::jsonb, true, 3),
  ('servicos', 'Serviços', 'O que fazemos', 'Serviços',
   'Do primeiro site à loja completa, com acompanhamento em cada etapa.',
   '{}'::jsonb, true, 4),
  ('processo', 'Processo', 'Como trabalhamos', 'Processo',
   'Quatro etapas claras, do primeiro contato à entrega.',
   '{}'::jsonb, true, 5),
  ('portfolio', 'Portfólio', 'Projetos', 'Portfólio',
   'Alguns projetos e conceitos que mostram o nosso jeito de trabalhar.',
   '{}'::jsonb, true, 6),
  ('faq', 'Dúvidas', 'Perguntas frequentes', 'Dúvidas',
   'As perguntas que mais aparecem na primeira conversa, respondidas sem rodeio.',
   '{}'::jsonb, true, 7),
  ('cta', 'Começar', 'Pronto para colocar seu negócio no ar?', null,
   'Conte o que você precisa. A primeira conversa é sem compromisso.',
   '{"botao":"Falar com especialista"}'::jsonb, true, 8),
  ('contato', 'Contato', 'Vamos conversar', 'Contato',
   'Conte um pouco sobre o seu projeto e retornamos em até um dia útil.',
   '{}'::jsonb, true, 9)
on conflict (id) do nothing;
