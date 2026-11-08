# Pendências

Coisas que ficaram em aberto e **dependem de uma decisão ou de um arquivo do
dono**. Cada sessão que encontrar uma nova pendência acrescenta aqui, com data
e contexto.

Legenda: 🔴 bloqueia a publicação · 🟡 deveria ser resolvido antes de divulgar
· 🟢 melhoria

---

## 1. 🟡 Os arquivos de marca vieram de um JPEG, sem transparência

**Registrado em:** 07/11/2026 (Parte 0)

A pasta `identidade/` tem **dois JPEGs** que são *pranchas de identidade*
(brand board e folha de logos) — não arquivos de logo isolados. Consequências:

- Não existe logo com fundo transparente, nem vetor (SVG/AI/EPS).
- Tudo em `public/brand/` foi **recortado** dessas pranchas. A forma da logo
  não foi tocada, mas a resolução é limitada pelo tamanho na prancha
  (o símbolo isolado, por exemplo, tem só 249×206 px).
- O fundo sólido deixava um retângulo visível em volta da logo sobre qualquer
  cor da paleta. Por isso `npm run brand:assets` gera versões
  `-transparente.png`, recortando o fundo por distância de cor e desfazendo a
  mistura nas bordas suavizadas. **É uma operação mecânica e reversível: os
  recortes originais continuam no repositório.**

**O que resolve de vez:** o dono pedir ao designer os arquivos originais —
idealmente **SVG** (ou PNG com alpha em alta resolução) de:

1. Lockup horizontal
2. Lockup horizontal com assinatura
3. Lockup vertical
4. Símbolo isolado
5. **Uma versão clara/monocromática do lockup para fundo escuro** (hoje não
   existe; usamos o badge e o tile verdes como alternativa)

Com o SVG em mãos, trocar é simples: substituir os arquivos em `public/brand/`
e ajustar os caminhos em `src/components/brand/Logo.tsx`.

---

## 2. 🟡 A fonte ASTRON não está disponível

**Registrado em:** 07/11/2026 (Parte 0)

O brand board define **ASTRON** como tipografia primária (display). Ela não é
uma fonte web pública e o dono não forneceu os arquivos licenciados.

**Em uso hoje:** **Montserrat** (Google Fonts) como substituta de display.
A secundária, **Inter**, é a oficial e já está correta.

**Como trocar quando os arquivos chegarem:** mexe só em `src/app/layout.tsx`.
Coloque os arquivos em `src/app/fonts/`, troque o import de
`next/font/google` por `next/font/local` e mantenha o nome da variável CSS
`--font-arka-display`. Nenhum outro arquivo precisa mudar.

---

## 3. 🔴 Dados de contato são parcialmente provisórios

**Registrado em:** 07/11/2026 (Parte 0)

WhatsApp e Instagram confirmados pelo responsável em 07/11/2026. Em
`src/content/site.ts`, os campos ainda marcados com `[CONFIRMAR]` são:

| Campo | Valor |
| --- | --- |
| `url` | `https://arkatechnologies.com.br` |
| `contato.email` | `contato@arkatechnologies.com.br` |
| `contato.cidade` | `Brasil` |

O contato principal do site é o Instagram `@technologiesarka`. O WhatsApp é
`(51) 99513-9984` e fica disponível como alternativa.

---

## 4. 🟡 A lista de serviços precisa ser confirmada

**Registrado em:** 07/11/2026 (Parte 0)

O briefing fala em "5 serviços" mas não diz quais. Os cinco em
`src/content/services.ts` foram deduzidos do brand board e do tipo de
negócio: site institucional, loja virtual, landing page, sistemas sob medida,
manutenção e suporte.

O dono precisa confirmar a lista e o que entra em cada um. Nenhum preço foi
inventado — e nenhum deve ser, até que ele defina.

---

## 5. 🟢 O portfólio só tem projetos conceito

**Registrado em:** 07/11/2026 (Parte 0)

Os seis projetos em `src/content/projects.ts` estão marcados com
`isConcept: true` e aparecem com a etiqueta "Conceito" no site. São
demonstrações, não trabalhos de clientes.

**Regra que não muda:** projeto de cliente real só entra no portfólio com
**autorização por escrito do cliente**. A Parte 8 mostra esse aviso fixo na
tela de cadastro do painel.

---

## 6. 🟢 Textos institucionais são provisórios

**Registrado em:** 07/11/2026 (Parte 0)

Todo o texto em `src/content/*` é uma versão base escrita pela Parte 0 a
partir do brand board, só para o site funcionar e poder ir ao ar. A **Parte C**
é a dona dos textos e vai reescrever tudo, mantendo as mesmas chaves.

---

## 7. 🔴 Google Ads precisa dos IDs reais

**Registrado em:** 07/11/2026 (pedido do dono)

O site já está preparado para Google Ads, Analytics e Tag Manager, mas
**nenhum script é injetado enquanto não houver ID configurado** — hoje o
rastreamento está inerte.

Para ligar, preencha em `.env.local` (copie de `.env.example`) e, na Vercel,
nas variáveis de ambiente do projeto:

| Variável | Onde encontrar | Formato |
| --- | --- | --- |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | Google Ads → Admin → Vinculações | `AW-XXXXXXXXXX` |
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSAO` | Google Ads → Metas → Ação de conversão → Tag | `AW-XXXXXXXXXX/abcDEFghiJKL` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics → Admin → Fluxo de dados | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_GTM_ID` | Tag Manager → container | `GTM-XXXXXXX` |

Depois da Parte 7 esses valores também poderão ser editados pelo painel
(chave `rastreamento` em `site_settings`), e o que estiver no banco terá
prioridade sobre a variável de ambiente — assim dá para trocar sem deploy.

**Conversões já instrumentadas** (em `src/lib/conversoes.ts`):
`contato_formulario`, `contato_whatsapp`, `contato_email`.

---

## 8. 🟡 Consentimento de cookies (LGPD)

**Registrado em:** 07/11/2026

Os scripts de Google Ads e Analytics usam cookies de publicidade e medição.
Hoje eles carregam assim que a página abre, sem pedir consentimento.

Para a maioria dos sites brasileiros isso é o que se pratica, mas se você
quiser seguir a LGPD à risca — ou se o site receber visitantes da União
Europeia, onde isso não é opcional — será preciso:

1. Um banner de consentimento que só libere os scripts após o aceite.
2. Guardar a escolha da pessoa e permitir mudá-la depois.
3. Usar o Consent Mode do Google (`gtag('consent', 'default', ...)`).

O ponto de entrada para isso é `src/components/tracking/Rastreamento.tsx`:
é só condicionar a renderização ao consentimento. **Decisão do dono** —
não implementei porque muda a experiência de quem entra no site.
