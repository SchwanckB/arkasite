/**
 * ARKA TECHNOLOGIES - textos da marca.
 *
 * Proprietario: Parte C. Este arquivo e a fonte de todo texto institucional
 * do site. Componentes consomem via @/lib/data, nunca importando daqui direto.
 *
 * Voz: portugues do Brasil, profissional, proxima e confiante. Frases curtas.
 * Sem clichê de agencia e sem numero, cliente ou premio inventado.
 *
 * ---------------------------------------------------------------------------
 * TEXTOS QUE O DONO PRECISA CONFIRMAR (marcados com [CONFIRMAR] no corpo)
 *
 * 1. faq "prazo"       - as faixas de prazo (2 a 3 semanas / 4 a 6 semanas)
 *                        foram estimadas. Ajuste para a sua realidade.
 * 2. faq "pagamento"   - a divisao "metade no inicio, metade na entrega" e
 *                        uma pratica comum, mas precisa ser a SUA pratica.
 * 3. faq "manutencao"  - diz que existe plano mensal opcional, sem preco.
 *                        Confirme se voce oferece isso.
 * 4. faq "hospedagem"  - diz que a ARKA cuida da configuracao. Confirme.
 * 5. visao             - escrita a partir do tom da marca, nao de um
 *                        planejamento estrategico seu. Vale uma leitura.
 * 6. indicadores       - os tres diferenciais afirmam "codigo proprio, sem
 *                        construtor de pagina". Confirme que e sempre verdade.
 *
 * Nenhum preco, prazo fechado, numero de clientes ou premio foi inventado.
 * ---------------------------------------------------------------------------
 */

export type Valor = { nome: string; descricao: string };
export type Indicador = { titulo: string; descricao: string };
export type Pergunta = { id: string; pergunta: string; resposta: string };

export const brand = {
  /* ---------------------------------------------------------------- */
  /* Manifesto                                                         */
  /* ---------------------------------------------------------------- */

  manifesto: {
    paragrafos: [
      "A internet está cheia de sites que ninguém lembra.",
      "A gente constrói o contrário: páginas que abrem rápido, dizem a coisa certa e levam alguém a entrar em contato.",
      "Todo projeto começa com uma conversa sobre o seu negócio — não sobre tecnologia.",
      "A parte técnica é problema nosso. O resultado é seu.",
    ],
    assinatura: "Tecnologia que conecta sua marca ao futuro.",
  },

  /* ---------------------------------------------------------------- */
  /* Missao, visao e valores                                           */
  /* ---------------------------------------------------------------- */

  missao:
    "Dar a negócios de todo tamanho uma presença digital que trabalha por eles: bem feita, rápida e fácil de manter.",

  // [CONFIRMAR] escrita a partir do tom da marca.
  visao:
    "Ser o estúdio que uma empresa procura quando quer um site que dura, e não um site que precisa ser refeito no ano seguinte.",

  valores: [
    {
      nome: "Clareza",
      descricao:
        "Explicamos cada etapa em português, sem jargão técnico e sem letra miúda.",
    },
    {
      nome: "Capricho",
      descricao:
        "Detalhe não é luxo. É o que separa um site bom de um site esquecível.",
    },
    {
      nome: "Compromisso",
      descricao:
        "Prazo combinado é prazo cumprido. Se algo mudar no caminho, você fica sabendo antes.",
    },
    {
      nome: "Durabilidade",
      descricao:
        "Construímos com tecnologia atual para o site envelhecer bem e continuar fácil de atualizar.",
    },
    {
      nome: "Proximidade",
      descricao:
        "Você fala com quem constrói o seu site, do primeiro contato ao suporte.",
    },
  ] satisfies Valor[],

  /* ---------------------------------------------------------------- */
  /* Sobre                                                             */
  /* ---------------------------------------------------------------- */

  sobre: {
    /** Versao curta: hero, rodape, meta description. */
    curto:
      "Estúdio de tecnologia especializado em presença digital. Criamos sites que abrem rápido, funcionam em qualquer tela e dão resultado.",

    /** Versao longa: secao Sobre. */
    longo: [
      "A ARKA Technologies nasceu de uma inconformidade simples: a maioria dos negócios merece um site melhor do que tem.",
      "Trabalhamos com empresas que precisam de presença digital de verdade — não de uma página genérica feita às pressas. Unimos design cuidadoso e código bem escrito para entregar sites rápidos, claros e preparados para crescer junto com o negócio.",
      "Cada projeto é construído do zero, com acompanhamento em todas as etapas e alguém de verdade do outro lado quando você precisar.",
    ],
  },

  /**
   * Tres indicadores de diferenciacao. Sao frases, nao numeros - a marca
   * ainda nao tem historico publico para citar.
   * [CONFIRMAR] o primeiro afirma que nunca usamos construtor de pagina.
   */
  indicadores: [
    {
      titulo: "Código próprio, não template",
      descricao:
        "Nada de tema pronto adaptado às pressas. Cada site é construído para o seu negócio.",
    },
    {
      titulo: "Velocidade como requisito",
      descricao:
        "Performance entra no projeto desde o começo, não como ajuste de última hora.",
    },
    {
      titulo: "Suporte com nome e rosto",
      descricao:
        "Depois da entrega, você continua falando com quem construiu o seu site.",
    },
  ] satisfies Indicador[],

  /* ---------------------------------------------------------------- */
  /* Perguntas frequentes                                              */
  /* ---------------------------------------------------------------- */

  faq: [
    {
      id: "prazo",
      pergunta: "Quanto tempo leva para o site ficar pronto?",
      // [CONFIRMAR] faixas estimadas.
      resposta:
        "Depende do tamanho. Uma landing page costuma levar de 2 a 3 semanas; um site institucional, de 4 a 6 semanas; uma loja virtual, um pouco mais. O prazo exato sai na proposta, depois da primeira conversa, e vale como combinado.",
    },
    {
      id: "comecar",
      pergunta: "O que eu preciso ter em mãos para começar?",
      resposta:
        "Menos do que você imagina. Basta saber o que o seu negócio faz e para quem. Textos, fotos e logo ajudam a acelerar, mas se você não tiver, a gente organiza isso junto na etapa de planejamento.",
    },
    {
      id: "dominio-hospedagem",
      pergunta: "Vocês cuidam do domínio e da hospedagem?",
      // [CONFIRMAR] confirme que a ARKA faz essa configuracao.
      resposta:
        "Sim. Cuidamos da configuração do domínio e da publicação do site. O domínio fica registrado no seu nome — ele é seu, não nosso. Os custos de registro e hospedagem são cobrados à parte, direto do fornecedor, sem intermediação.",
    },
    {
      id: "editar-sozinho",
      pergunta: "Consigo editar o site sozinho depois?",
      resposta:
        "Sim. Entregamos um painel administrativo simples, em português, para você trocar textos, imagens e projetos sem depender de ninguém. Na entrega mostramos como usar.",
    },
    {
      id: "manutencao",
      pergunta: "E depois que o site está no ar?",
      // [CONFIRMAR] confirme se existe plano mensal.
      resposta:
        "A gente não some. Há um período de acompanhamento incluído para ajustes finais, e existe a opção de um plano mensal de manutenção com atualizações, backups e pequenas alterações. Você escolhe se faz sentido.",
    },
    {
      id: "pagamento",
      pergunta: "Como funciona o pagamento?",
      // [CONFIRMAR] confirme a divisao.
      resposta:
        "Normalmente em duas partes: metade para iniciar o projeto e metade na entrega. Para projetos maiores dá para parcelar em mais vezes. Tudo combinado por escrito antes de começar, sem cobrança surpresa.",
    },
    {
      id: "site-antigo",
      pergunta: "Meu site atual está velho. Dá para aproveitar alguma coisa?",
      resposta:
        "Quase sempre dá. Textos, fotos e o endereço na internet costumam ser aproveitados, e tomamos cuidado para o seu site não perder posição no Google na troca. O que não se aproveita é o que estava atrapalhando.",
    },
    {
      id: "fora-da-cidade",
      pergunta: "Vocês atendem clientes de outras cidades?",
      resposta:
        "Sim. Todo o processo funciona bem à distância, por videochamada e WhatsApp. Você acompanha o projeto por um endereço de testes desde as primeiras semanas.",
    },
  ] satisfies Pergunta[],

  /* ---------------------------------------------------------------- */
  /* Microcopy                                                         */
  /* ---------------------------------------------------------------- */

  microcopy: {
    botoes: {
      contatoPrimario: "Falar com especialista",
      verPortfolio: "Ver portfólio",
      verServicos: "Ver serviços",
      enviarFormulario: "Enviar mensagem",
      enviando: "Enviando...",
      whatsapp: "Chamar no WhatsApp",
      email: "Enviar e-mail",
      verProjeto: "Ver projeto",
      fechar: "Fechar",
      voltarAoTopo: "Voltar ao topo",
      abrirMenu: "Abrir menu",
      fecharMenu: "Fechar menu",
    },

    formulario: {
      titulo: "Conte sobre o seu projeto",
      descricao: "Respondemos em até um dia útil.",
      rotulos: {
        nome: "Seu nome",
        email: "E-mail",
        telefone: "Telefone ou WhatsApp",
        empresa: "Empresa",
        tipoProjeto: "O que você precisa",
        mensagem: "Conte um pouco sobre o projeto",
      },
      dicas: {
        telefone: "Opcional, mas acelera o retorno.",
        empresa: "Opcional.",
        mensagem: "Pode ser curto. O que importa é entendermos o objetivo.",
      },
      opcional: "opcional",
      erros: {
        nome: "Escreva o seu nome.",
        email: "Confira o e-mail: parece que falta algo.",
        mensagem: "Conte pelo menos uma frase sobre o projeto.",
        mensagemCurta: "Mais uma frase ajuda bastante a entender o que você precisa.",
        generico: "Não conseguimos enviar agora.",
      },
      sucesso: {
        titulo: "Mensagem enviada",
        descricao:
          "Recebemos o seu contato e respondemos em até um dia útil. Se for urgente, chame no WhatsApp.",
      },
      /** Quando nem banco nem e-mail estao configurados. Honesto, com saida. */
      naoConfigurado: {
        titulo: "O envio automático ainda não está ligado",
        descricao:
          "Este site acabou de entrar no ar e o formulário ainda não está conectado. Fale com a gente pelo WhatsApp ou por e-mail — respondemos do mesmo jeito.",
      },
    },

    estadosVazios: {
      portfolio: "Em breve, novos projetos por aqui.",
      portfolioFiltro: "Nenhum projeto nesta categoria por enquanto.",
      servicos: "Os serviços serão publicados em breve.",
    },

    carregando: "Carregando...",

    etiquetas: {
      conceito: "Conceito",
      conceitoExplicacao:
        "Projeto criado pela ARKA para demonstrar o nosso trabalho.",
    },
  },

  /* ---------------------------------------------------------------- */
  /* SEO                                                               */
  /* ---------------------------------------------------------------- */

  seo: {
    home: {
      titulo: "ARKA Technologies | Sites modernos que geram resultado",
      descricao:
        "Criamos sites institucionais, lojas virtuais e landing pages sob medida. Design atual, carregamento rápido e suporte de quem construiu.",
    },
    porSecao: {
      sobre: {
        titulo: "Sobre a ARKA",
        descricao:
          "Estúdio de tecnologia especializado em presença digital, do primeiro rascunho ao suporte depois da entrega.",
      },
      servicos: {
        titulo: "Serviços",
        descricao:
          "Sites institucionais, lojas virtuais, landing pages, sistemas sob medida e manutenção.",
      },
      portfolio: {
        titulo: "Portfólio",
        descricao: "Projetos e conceitos que mostram o nosso jeito de trabalhar.",
      },
      processo: {
        titulo: "Como trabalhamos",
        descricao:
          "Quatro etapas claras: conversa, planejamento, desenvolvimento e entrega.",
      },
      contato: {
        titulo: "Contato",
        descricao:
          "Conte sobre o seu projeto. Respondemos em até um dia útil.",
      },
    },
  },

  /* ---------------------------------------------------------------- */
  /* Textos alternativos das imagens de marca                          */
  /* ---------------------------------------------------------------- */

  alt: {
    logoCompleta: "ARKA Technologies",
    logoComAssinatura:
      "ARKA Technologies — tecnologia que conecta sua marca ao futuro",
    simbolo: "Símbolo da ARKA Technologies",
    /** Use string vazia quando o nome da marca ja aparecer em texto ao lado. */
    simboloDecorativo: "",
    mockupProjeto: (nome: string, dispositivo: string) =>
      `Projeto ${nome} apresentado em ${dispositivo}`,
  },

  /* ---------------------------------------------------------------- */
  /* WhatsApp                                                          */
  /* ---------------------------------------------------------------- */

  whatsapp: {
    mensagemPadrao:
      "Olá! Vim pelo site da ARKA e gostaria de falar sobre um projeto.",
    mensagemServico: (servico: string) =>
      `Olá! Vim pelo site da ARKA e gostaria de falar sobre ${servico}.`,
    mensagemOrcamento:
      "Olá! Vim pelo site da ARKA e gostaria de pedir um orçamento.",
  },
} as const;
