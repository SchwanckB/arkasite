# ARKA TECHNOLOGIES — Manual da marca

> **Fonte única da verdade visual deste projeto.**
> Toda sessão de trabalho (humana ou agente) deve ler este arquivo antes de
> começar. Só abra os PNGs de `identidade/` se a sua tarefa for muito visual
> (logo, hero, sobre, portfólio) ou se tiver dúvida de marca — as imagens são
> pesadas e este documento já traz as decisões.

Derivado dos dois arquivos originais em `identidade/`:

| Arquivo | O que é |
| --- | --- |
| `WhatsApp Image 2026-11-06 at 22.04.41.jpeg` | Brand board: paleta, tipografia, construção do símbolo, padrões visuais, aplicações |
| `WhatsApp Image 2026-11-06 at 22.08.05.jpeg` | Folha de logos: lockups, variantes de símbolo, selo, badges e tiles |

---

## 1. Posicionamento e tom visual

**Assinatura oficial:** *Tecnologia que conecta sua marca ao futuro.*

A identidade é **sóbria, natural e técnica**. Verde musgo e areia dão um tom
orgânico e maduro, afastando a marca do clichê "startup azul". O símbolo é
geométrico e construído em traço contínuo, o que sugere precisão e
continuidade.

Traduzido para o site:

- Muito respiro. Espaço em branco é parte da identidade, não desperdício.
- Contraste vem da **tipografia e do espaçamento**, não de cores berrantes.
- Movimento discreto e suave. Nada de salto, quique ou brilho.
- Cantos levemente arredondados (`--radius-marca`), nunca totalmente quadrados
  nem em formato de pílula, exceto em botões e etiquetas pequenas.
- Fotografia e mockups em tons neutros, nunca saturados.

---

## 2. Paleta

Cinco cores. **Não existe uma sexta.**

| Nome | HEX | Token Tailwind | Uso |
| --- | --- | --- | --- |
| Off-white | `#F4F3F0` | `off-white` | Fundo padrão de todo o site |
| Verde musgo | `#4E5A46` | `musgo` | Cor de ação: botões, links, ícones, destaques |
| Verde sálvia | `#7D8B79` | `salvia` | Apoio: sobretítulos, textos secundários, detalhes |
| Areia | `#DAD2C2` | `areia` | Fundos alternados, separadores, etiquetas |
| Grafite | `#252626` | `grafite` | Texto principal e fundos escuros |

### Conferência das cores

Os rótulos impressos no brand board têm **ruído de renderização** (aparecem
como `#4ESA46` e `#2S2626`, com `S` no lugar de `5`). Por isso as cores foram
confirmadas por **amostragem direta de pixel** nos quadrados da paleta:

| Cor | Amostrado no JPEG | Valor oficial adotado |
| --- | --- | --- |
| Off-white | `#F6F2EF` | `#F4F3F0` |
| Verde musgo | `#535F49` | `#4E5A46` |
| Verde sálvia | `#838C79` | `#7D8B79` |
| Areia | `#D4CBBA` | `#DAD2C2` |
| Grafite | `#2C2C2C` | `#252626` |

A diferença é compressão JPEG (a imagem puxa para o quente e clareia os tons
escuros). Todos os valores amostrados ficam dentro dessa margem, então
**não há divergência entre os PNGs e o briefing**: a paleta do briefing vale.

### Variações derivadas

Existem só para estado e profundidade (hover, pressionado, camadas). **Não são
cores novas** e não devem aparecer em nada que o painel permita escolher:

`musgo-escuro #3C4636` · `musgo-claro #637058` · `salvia-claro #9AA597` ·
`areia-claro #E8E3D8` · `grafite-suave #3A3B3B`

### Papéis semânticos

Prefira sempre o token semântico ao token de cor crua — assim o painel
(Parte 8) consegue trocar o tema sem reescrever componente:

`fundo` · `fundo-alt` · `fundo-escuro` · `superficie` · `texto` ·
`texto-suave` · `texto-invertido` · `destaque` · `destaque-suave` ·
`borda` · `borda-forte`

### Contraste

- Grafite sobre off-white: ~14:1. Seguro para qualquer tamanho.
- Musgo sobre off-white: ~7:1. Seguro para texto e botões.
- **Sálvia sobre off-white: ~3:1.** Só para texto grande, sobretítulos em
  maiúsculas ou elementos decorativos. **Nunca para texto corrido.**
- Off-white sobre musgo: ~7:1. Seguro.

---

## 3. Tipografia

| Papel | Fonte da identidade | O que está em uso | Token |
| --- | --- | --- | --- |
| Display (títulos) | **ASTRON** | **Montserrat** (substituta) | `font-display` |
| Texto (corpo, interface) | **INTER** | Inter | `font-sans` |

> **Pendência:** a ASTRON não está disponível como fonte web e o dono ainda
> não forneceu os arquivos licenciados. Até lá, Montserrat é a substituta de
> display — geométrica e de peso parecido. Ver `docs/PENDENCIAS.md`, item 2;
> a troca mexe em um arquivo só (`src/app/layout.tsx`).

Regras de uso:

- Títulos (`h1`–`h4`) usam `font-display` automaticamente, via `globals.css`.
- Sobretítulos de seção: maiúsculas, `tracking-[0.18em]`, peso 600, em sálvia.
  É um padrão forte da marca — mantenha.
- Corpo de texto em Inter, nunca em display.
- `text-balance` em títulos e `text-pretty` em parágrafos, para evitar linha
  órfã.

---

## 4. Logo

### Arquivos

Todos em `public/brand/`, recortados da folha de logos oficial. **Nenhum foi
redesenhado.**

| Arquivo | Para qual fundo | Componente |
| --- | --- | --- |
| `logo-horizontal-transparente.png` | Claro | `<Logo variante="horizontal" />` |
| `logo-horizontal-tagline-transparente.png` | Claro | `<Logo variante="horizontal-tagline" />` |
| `logo-vertical-transparente.png` | Claro | `<Logo variante="vertical" />` |
| `logo-simbolo-transparente.png` | Claro | `<ArkaSymbol variante="simples" />` |
| `badge-horizontal-musgo.png` | **Escuro** | `<Logo variante="badge-escuro" />` |
| `tile-quadrado-musgo.png` | **Escuro** | `<Logo variante="tile-escuro" />` |
| `simbolo-circulo-musgo.png` | Qualquer (tem fundo próprio) | `<ArkaSymbol variante="circulo-musgo" />` |
| `simbolo-circulo-claro.png` | **Escuro** | `<ArkaSymbol variante="circulo-claro" />` |
| `simbolo-squircle-musgo.png` | Qualquer | `<ArkaSymbol variante="squircle-musgo" />` |
| `simbolo-squircle-claro.png` | **Escuro** | `<ArkaSymbol variante="squircle-claro" />` |
| `selo-circular.png` | Claro | Selo decorativo, uso pontual |

Os arquivos sem sufixo (`logo-horizontal.png` etc.) são os recortes crus, com
o fundo sólido do brand board. Ficam guardados como referência — **o site usa
as versões `-transparente`**.

### A regra mais importante

**A logo da ARKA é verde musgo e some sobre fundo escuro.** Em qualquer seção
com `fundo="escuro"` ou `fundo="musgo"`, use as variantes marcadas como
**Escuro** na tabela. Não tente clarear, inverter ou aplicar filtro na logo
verde.

### Proibido

- Redesenhar, vetorizar à mão ou "melhorar" o traço.
- Recolorir fora das variantes acima.
- Distorcer, inclinar, rotacionar ou aplicar sombra/brilho.
- Colocar sobre foto movimentada ou fundo de baixo contraste.
- Reescrever "ARKA TECHNOLOGIES" com fonte do sistema no lugar do arquivo.

### Área de respeito

Margem livre em todos os lados igual à **altura do símbolo "A" dividida por 2**.
Na prática: para uma logo de 40px de altura, deixe ~20px livres em volta.
Nada de texto, borda ou imagem dentro dessa área.

### Tamanhos mínimos

| Elemento | Mínimo em tela | Observação |
| --- | --- | --- |
| Símbolo isolado | **24 px** de altura | Abaixo disso o traço interno fecha |
| Lockup horizontal | **28 px** de altura | Abaixo disso "TECHNOLOGIES" some |
| Lockup com assinatura | **48 px** de altura | A assinatura é o limitante |
| Lockup vertical | **56 px** de altura | — |

No cabeçalho o padrão é 34px; no rodapé, 56px (com assinatura).

---

## 5. Padrões visuais

O brand board traz três texturas de apoio: **traçado de circuito**, **bloco
musgo sólido** e **grade de pontos**. Use com muita parcimônia — no máximo uma
por tela, sempre com opacidade baixa, sempre atrás do conteúdo e nunca
competindo com texto.

---

## 6. Movimento

A linguagem de movimento vive em `src/lib/motion.ts` e está espelhada em
custom properties no `globals.css`. **Nenhum componente deve inventar curva ou
duração própria.**

| Token | Valor | Quando usar |
| --- | --- | --- |
| `easing.marca` | `cubic-bezier(0.22, 1, 0.36, 1)` | Curva padrão de quase tudo |
| `easing.suave` | `cubic-bezier(0.4, 0, 0.2, 1)` | Hover, foco, cor |
| `duracao.rapida` | 180 ms | Micro-feedback |
| `duracao.media` | 380 ms | Modais, menus, acordeões |
| `duracao.secao` | 700 ms | Entrada de seção, reveals |

Variantes prontas: `fade`, `fadeUp`, `fadeDown`, `fadeLeft`, `fadeRight`,
`escala`, `mascara`, `linha`, mais o `stagger()` para encadear filhos.

Na prática, use `<Reveal />` e `<RevealItem />` em vez de `motion.div` solto.

**`prefers-reduced-motion` é obrigatório.** Os hooks `useVariante` e
`useStagger` já tratam isso: com movimento reduzido o conteúdo aparece sem
deslocamento — e **nunca** fica invisível. Nenhuma animação pode causar
deslocamento de layout.

---

## 7. Aplicação no site

- Fundo padrão off-white; alterne com `areia-claro` para dar ritmo entre
  seções. Use musgo ou grafite em no máximo uma ou duas faixas por página.
- Botão primário: musgo sólido com texto off-white. Secundário: contorno
  musgo. Em fundo escuro, use a variante `claro`.
- Cartões: fundo branco, borda `borda`, cantos `radius-marca-lg`, sombra só
  no hover.
- Ícones: `lucide-react`, traço 1.5, em musgo (ou sálvia quando secundário).
- Foco visível em musgo com deslocamento de 3px — já definido globalmente.

---

## 8. Checklist antes de entregar uma tela

- [ ] Só usei as cinco cores da paleta (ou as variações de estado).
- [ ] A logo está em arquivo oficial, na variante certa para o fundo.
- [ ] Respeitei a área de respeito e o tamanho mínimo.
- [ ] Títulos em `font-display`, corpo em Inter.
- [ ] Nenhum texto corrido em sálvia sobre off-white.
- [ ] Animações usam tokens de `motion.ts` e respeitam movimento reduzido.
- [ ] Sem rolagem horizontal em 375px.
- [ ] Foco de teclado visível em tudo que é interativo.
