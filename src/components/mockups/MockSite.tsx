/**
 * Website concept previews, drawn locally with HTML and SVG.
 *
 * These are original illustrations, not screenshots or claims of client work.
 */

import type { Project } from "@/lib/data/types";

type Cena =
  | "bistro"
  | "atelie"
  | "clinica"
  | "construtora"
  | "curso"
  | "petshop"
  | "imobiliaria"
  | "arquitetura"
  | "consultoria";

type Preview = {
  marca: string;
  chamada: string;
  apoio: string;
  botao: string;
  categoria: string;
  destaque: string;
  fundo: string;
  tinta: string;
  cena: Cena;
  itens: [string, string, string];
};

const PREVIEWS: Record<string, Preview> = {
  "bistro-conceito": {
    marca: "CASA AMORA",
    chamada: "Comida boa tem gosto de encontro.",
    apoio: "Receitas da estação, feitas sem pressa e com ingredientes locais.",
    botao: "Ver cardápio",
    categoria: "COZINHA DE BAIRRO",
    destaque: "#a84e32",
    fundo: "#f7eee2",
    tinta: "#38281f",
    cena: "bistro",
    itens: ["Menu da estação", "Feito por aqui", "Reserve sua mesa"],
  },
  "atelie-conceito": {
    marca: "LINHA DE CASA",
    chamada: "Vista o que faz sentido para você.",
    apoio: "Peças autorais, feitas em pequenos lotes e para durar.",
    botao: "Conheça a coleção",
    categoria: "MODA AUTORAL",
    destaque: "#92745f",
    fundo: "#f2eee8",
    tinta: "#302c28",
    cena: "atelie",
    itens: ["Novidades", "Feito à mão", "Nossa história"],
  },
  "clinica-conceito": {
    marca: "VIVA BEM",
    chamada: "Cuidar de você pode ser mais simples.",
    apoio: "Uma equipe próxima, pronta para acompanhar cada fase.",
    botao: "Agendar consulta",
    categoria: "CLÍNICA INTEGRADA",
    destaque: "#267d78",
    fundo: "#eaf5f2",
    tinta: "#173d3a",
    cena: "clinica",
    itens: ["Especialidades", "Nossa equipe", "Agendamento"],
  },
  "construtora-conceito": {
    marca: "MORADA",
    chamada: "Um lugar novo para chamar de seu.",
    apoio: "Projetos pensados para viver bem hoje e por muito tempo.",
    botao: "Explorar projetos",
    categoria: "ARQUITETURA E OBRA",
    destaque: "#aa7047",
    fundo: "#f3eee7",
    tinta: "#392d25",
    cena: "construtora",
    itens: ["Residencial Aurora", "Materiais", "Fale com a equipe"],
  },
  "curso-conceito": {
    marca: "PRÁTICA",
    chamada: "Aprenda no seu ritmo. Aplique de verdade.",
    apoio: "Aulas objetivas para transformar conhecimento em prática.",
    botao: "Ver o programa",
    categoria: "FORMAÇÃO ONLINE",
    destaque: "#7054b3",
    fundo: "#f1edfa",
    tinta: "#2e2542",
    cena: "curso",
    itens: ["Aulas diretas", "Comunidade", "Acesso imediato"],
  },
  "petshop-conceito": {
    marca: "BICHO LEVE",
    chamada: "Mais cuidado para quem está sempre ao seu lado.",
    apoio: "Banho, carinho e uma equipe que conhece seu melhor amigo.",
    botao: "Marcar um horário",
    categoria: "CUIDADO PET",
    destaque: "#d27847",
    fundo: "#fbf0e7",
    tinta: "#3d302a",
    cena: "petshop",
    itens: ["Banho e tosa", "Quem somos", "Agende por aqui"],
  },
  "imobiliaria-conceito": {
    marca: "CHAVE URBANA",
    chamada: "Seu próximo capítulo começa em casa.",
    apoio: "Encontre um espaço com a sua cara e no seu tempo.",
    botao: "Buscar imóveis",
    categoria: "IMÓVEIS SELECIONADOS",
    destaque: "#376f65",
    fundo: "#edf2ec",
    tinta: "#263a34",
    cena: "imobiliaria",
    itens: ["Apartamentos", "Casas", "Converse com um corretor"],
  },
  "arquitetura-conceito": {
    marca: "TRAÇO VIVO",
    chamada: "Espaços que contam novas histórias.",
    apoio: "Arquitetura sensível ao lugar, à rotina e a quem vai viver.",
    botao: "Ver projetos",
    categoria: "ESTÚDIO DE ARQUITETURA",
    destaque: "#6d7560",
    fundo: "#f1f0e9",
    tinta: "#30332c",
    cena: "arquitetura",
    itens: ["Casa Horizonte", "Nosso processo", "Vamos conversar"],
  },
  "consultoria-conceito": {
    marca: "NORTE",
    chamada: "Clareza para decidir o próximo passo.",
    apoio: "Estratégia prática para negócios que querem crescer com intenção.",
    botao: "Agendar conversa",
    categoria: "CONSULTORIA DE NEGÓCIOS",
    destaque: "#3565a4",
    fundo: "#eef2f8",
    tinta: "#25354b",
    cena: "consultoria",
    itens: ["Diagnóstico", "Plano de ação", "Acompanhamento"],
  },
};

const FALLBACK: Record<Project["variante"], Preview> = {
  institucional: PREVIEWS["construtora-conceito"],
  loja: PREVIEWS["atelie-conceito"],
  landing: PREVIEWS["curso-conceito"],
  servico: PREVIEWS["consultoria-conceito"],
};

function CenaIlustrada({ cena, destaque }: { cena: Cena; destaque: string }) {
  return (
    <svg
      viewBox="0 0 220 160"
      role="presentation"
      className="h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="220" height="160" rx="18" fill="#ffffff" fillOpacity=".42" />
      <circle cx="174" cy="38" r="23" fill={destaque} fillOpacity=".13" />
      <circle cx="40" cy="126" r="28" fill={destaque} fillOpacity=".1" />
      {cena === "bistro" ? (
        <>
          <ellipse cx="113" cy="130" rx="77" ry="15" fill="#74452f" fillOpacity=".12" />
          <path d="M56 96h112l-10 27H66z" fill="#bd774c" />
          <path d="M64 93c0-22 23-39 49-39s49 17 49 39z" fill="#fffaf2" />
          <ellipse cx="113" cy="92" rx="43" ry="24" fill="#e7c89e" />
          <ellipse cx="113" cy="91" rx="29" ry="15" fill="#739052" />
          <circle cx="102" cy="88" r="7" fill="#c85a38" />
          <circle cx="123" cy="96" r="6" fill="#e8b254" />
          <path d="M90 69c-5-8 7-10 2-17m20 16c-5-8 7-10 2-17" fill="none" stroke="#a97753" strokeWidth="3" strokeLinecap="round" />
          <path d="M171 120V68m0 8c-17-1-18-17-18-17 16-2 20 9 18 17Zm0 14c16-1 18-17 18-17-16-2-20 9-18 17Z" fill="#64805a" />
        </>
      ) : null}
      {cena === "atelie" ? (
        <>
          <path d="M109 38c10 0 16 8 16 17l23 18-9 13-15-10-3 52H82l-3-52-15 10-9-13 23-18c0-9 6-17 16-17l8 9z" fill={destaque} />
          <path d="m95 48 13 13 12-13" fill="none" stroke="#f6eee5" strokeWidth="4" />
          <path d="M67 132h95" stroke="#745c49" strokeWidth="5" strokeLinecap="round" />
          <circle cx="171" cy="52" r="10" fill="#d8bd9e" />
          <path d="M171 62v29m-8-17h16" stroke="#92745f" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : null}
      {cena === "clinica" ? (
        <>
          <rect x="55" y="35" width="111" height="99" rx="18" fill="#fff" />
          <circle cx="109" cy="68" r="19" fill="#e9b69a" />
          <path d="M90 65c2-20 37-25 40 1-13-3-23-8-29-15-1 8-5 12-11 14Z" fill="#344c48" />
          <path d="M75 132c2-30 16-43 34-43s32 13 34 43" fill="#79aaa0" />
          <path d="M108 94v35m-13-17h26" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
          <circle cx="168" cy="47" r="16" fill={destaque} />
          <path d="M168 38v18m-9-9h18" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : null}
      {cena === "construtora" ? (
        <>
          <path d="M46 124V79l36-28 37 28v45z" fill="#e2c5a5" />
          <path d="M102 124V63l36-26 37 26v61z" fill={destaque} />
          <path d="M57 83h49v41H57z" fill="#f8f2e9" />
          <path d="M111 67h49v57h-49z" fill="#f5eee4" />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${120 + i * 14} 77v12m-7-6h14m-7 24v12m-7-6h14`} stroke="#b48b68" strokeWidth="3" />
          ))}
          <path d="M36 125h151" stroke="#8c735e" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : null}
      {cena === "curso" ? (
        <>
          <path d="M51 47c20-9 40-5 59 7v74c-19-12-39-16-59-7z" fill="#fff" />
          <path d="M169 47c-20-9-40-5-59 7v74c19-12 39-16 59-7z" fill="#ddd4f0" />
          <path d="M110 54v74" stroke="#8573b1" strokeWidth="4" />
          <path d="M67 68h27m-27 12h30m-30 12h24m44-24h19m-19 12h22m-22 12h17" stroke="#a79bc2" strokeWidth="4" strokeLinecap="round" />
          <circle cx="159" cy="42" r="19" fill={destaque} />
          <path d="m155 33 12 9-12 9z" fill="#fff" />
        </>
      ) : null}
      {cena === "petshop" ? (
        <>
          <ellipse cx="112" cy="129" rx="57" ry="11" fill="#754b36" fillOpacity=".13" />
          <path d="M72 82c0-26 17-44 40-44s40 18 40 44v28c0 14-14 25-40 25s-40-11-40-25z" fill="#c9895e" />
          <path d="M76 71C55 55 58 34 72 36c13 2 20 20 18 33m56 2c-2-20 5-33 18-35 14-2 17 19-4 35" fill="#80563f" />
          <ellipse cx="97" cy="84" rx="4" ry="6" fill="#342b27" />
          <ellipse cx="127" cy="84" rx="4" ry="6" fill="#342b27" />
          <ellipse cx="112" cy="100" rx="13" ry="9" fill="#f0d7bd" />
          <path d="M107 98h10l-5 5z" fill="#53392f" />
          <path d="M100 110c7 7 17 7 24 0" fill="none" stroke="#53392f" strokeWidth="3" strokeLinecap="round" />
          <circle cx="171" cy="51" r="13" fill={destaque} />
          <circle cx="164" cy="39" r="5" fill={destaque} />
          <circle cx="176" cy="36" r="5" fill={destaque} />
        </>
      ) : null}
      {cena === "imobiliaria" ? (
        <>
          <rect x="42" y="44" width="135" height="82" rx="9" fill="#fff" />
          <path d="M51 107 93 66l41 41v12H51z" fill="#d9e7da" />
          <path d="m105 107 31-31 31 31v12h-62z" fill={destaque} fillOpacity=".75" />
          <path d="M87 119v-22h15v22m37 0v-18h12v18" fill="#8a755e" />
          <path d="M49 126h126" stroke="#617c6e" strokeWidth="5" strokeLinecap="round" />
          <circle cx="153" cy="59" r="10" fill="#e6bc74" />
        </>
      ) : null}
      {cena === "arquitetura" ? (
        <>
          <path d="M44 124V67l50-30 49 30v57z" fill="#d6d5c7" />
          <path d="M96 124V52l39-24 43 24v72z" fill={destaque} />
          <path d="M59 75h25v28H59zm46-8h23v24h-23zm37-1h18v33h-18z" fill="#f7f4e9" />
          <path d="M96 92h29v32H96z" fill="#69735e" />
          <path d="M38 126h145" stroke="#53604b" strokeWidth="5" strokeLinecap="round" />
          <circle cx="53" cy="54" r="11" fill="#b9c3a7" />
        </>
      ) : null}
      {cena === "consultoria" ? (
        <>
          <rect x="48" y="40" width="126" height="87" rx="12" fill="#fff" />
          <path d="M65 107V89m21 18V73m21 34V82m22 25V61m21 46V48" stroke={destaque} strokeWidth="12" strokeLinecap="round" />
          <path d="m62 78 23-15 22 9 26-23 23 7" fill="none" stroke="#b1c6df" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="85" cy="63" r="4" fill="#6d92bd" />
          <circle cx="107" cy="72" r="4" fill="#6d92bd" />
          <circle cx="133" cy="49" r="4" fill="#6d92bd" />
        </>
      ) : null}
    </svg>
  );
}

type MockSiteProps = {
  projeto?: Pick<Project, "slug" | "nome" | "categoria" | "variante" | "dispositivo">;
};

export function MockSite({ projeto }: MockSiteProps) {
  const preview = (projeto && PREVIEWS[projeto.slug]) || FALLBACK[projeto?.variante ?? "institucional"];
  const mobile = projeto?.dispositivo === "mobile";
  const tamanhoTitulo = mobile ? 8 : projeto?.dispositivo === "tablet" ? 11 : 13;

  return (
    <div
      aria-hidden
      className="h-full w-full overflow-hidden"
      style={{ backgroundColor: preview.fundo, color: preview.tinta }}
    >
      <header className="flex items-center justify-between border-b border-black/5 px-[5%] py-[3%]">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[5px] text-[7px] font-bold text-white"
            style={{ backgroundColor: preview.destaque }}
          >
            {preview.marca.slice(0, 1)}
          </span>
          <span className="truncate text-[7px] font-bold tracking-[.13em]">
            {preview.marca}
          </span>
        </div>
        {!mobile ? (
          <nav className="flex items-center gap-2 text-[5px] opacity-65">
            <span>Início</span><span>Sobre</span><span>Contato</span>
          </nav>
        ) : (
          <span className="text-[9px]" style={{ color: preview.destaque }}>☰</span>
        )}
      </header>

      <main className={mobile ? "px-[6%] pt-[5%]" : "px-[6%] pt-[4%]"}>
        <div className={mobile ? "flex flex-col" : "grid grid-cols-[1.05fr_.95fr] items-center gap-[4%]"}>
          <div className={mobile ? "order-1" : ""}>
            <p
              className="font-semibold tracking-[.15em]"
              style={{ color: preview.destaque, fontSize: mobile ? 4 : 5 }}
            >
              {preview.categoria}
            </p>
            <h3
              className="mt-[3%] font-semibold leading-[1.08] tracking-[-.04em]"
              style={{ fontSize: tamanhoTitulo }}
            >
              {preview.chamada}
            </h3>
            <p
              className="mt-[3%] leading-[1.4] opacity-70"
              style={{ fontSize: mobile ? 5 : 6 }}
            >
              {preview.apoio}
            </p>
            <span
              className="mt-[5%] inline-flex rounded-full px-2 py-1 font-semibold text-white"
              style={{ backgroundColor: preview.destaque, fontSize: mobile ? 5 : 6 }}
            >
              {preview.botao}
            </span>
          </div>
          <div
            className={mobile ? "order-0 mb-[4%] h-[69px]" : "h-[94px]"}
          >
            <CenaIlustrada cena={preview.cena} destaque={preview.destaque} />
          </div>
        </div>

        <div className={mobile ? "mt-[7%]" : "mt-[6%]"}>
          <p className="text-[6px] font-semibold">{projeto?.nome ?? preview.marca}</p>
          <div className="mt-[2%] grid grid-cols-3 gap-[2%]">
            {preview.itens.map((item, index) => (
              <div
                key={item}
                className="min-h-[28px] rounded-md border border-black/5 bg-white/70 px-[7%] py-[6%]"
              >
                <span
                  className="mb-1 block h-[5px] w-[5px] rounded-full"
                  style={{ backgroundColor: preview.destaque, opacity: index === 1 ? 0.55 : 1 }}
                />
                <span className="block text-[4px] font-medium leading-tight">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
