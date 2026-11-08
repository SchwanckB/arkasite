# ARKA Technologies — site e painel

Site institucional da ARKA Technologies, com painel administrativo próprio
(financeiro, CRM, projetos e edição do site).

> O site público e os módulos do painel administrativo estão implementados.
> Para usar o painel com dados reais, configure o Supabase e aplique as
> migrações e o seed descritos em [docs/SETUP-SUPABASE.md](docs/SETUP-SUPABASE.md).

## Começando

```bash
npm install
npm run dev
```

Abra <http://localhost:3000>.

Não é preciso configurar banco nem variável de ambiente para rodar: a camada
de dados lê de `src/content/*` enquanto o Supabase não existir.

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run brand:assets` | Regenera logos transparentes, favicons e imagem OG |

## Documentação

Leia estes dois antes de mexer em qualquer coisa:

- **[docs/BRAND.md](docs/BRAND.md)** — paleta, logo, tipografia, movimento.
  Fonte única da verdade visual.
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — fluxo de dados, mapa de
  propriedade por parte, componentes disponíveis, convenções.
- **[docs/SETUP-SUPABASE.md](docs/SETUP-SUPABASE.md)** — conexão do painel,
  configuração do Google Search Console e passos de publicação.
- **[docs/PENDENCIAS.md](docs/PENDENCIAS.md)** — o que depende de uma decisão
  ou de um arquivo do dono.

## Estrutura

```
identidade/          pranchas de identidade originais (não versione saída daqui)
docs/                BRAND, ARCHITECTURE, PENDENCIAS
public/brand/        arquivos oficiais de logo
scripts/             geração de assets de marca
src/
  app/               layout, página inicial, tokens de design
  components/
    brand/           <Logo />, <ArkaSymbol />
    layout/          Header, Footer
    mockups/         <DeviceFrame />, <MockSite />
    sections/        seções do site (Server Components assíncronos)
    ui/              Container, Section, SectionHeading, Button, Card, Icone, Reveal
  content/           conteúdo estático (reserva e fonte do seed)
  lib/
    data/            ÚNICA porta de entrada de dados
    motion.ts        linguagem de movimento
    utils.ts         cn(), linkWhatsapp(), slugify()
```

## Regras que não se quebram

1. Seção **nunca** importa `src/content/*` direto — use `@/lib/data`.
2. Nenhuma cor fora da paleta de `docs/BRAND.md`.
3. A logo nunca é redesenhada, recolorida ou distorcida.
4. Animação só pelos tokens de `src/lib/motion.ts`, sempre respeitando
   `prefers-reduced-motion`.
5. Dinheiro sempre em centavos inteiros.
