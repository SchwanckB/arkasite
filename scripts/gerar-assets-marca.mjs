/**
 * Gera os assets derivados da marca a partir dos recortes oficiais de public/brand/.
 *
 * REGRA DE MARCA: este script nunca redesenha, vetoriza nem recolore a logo.
 * Ele so faz operacoes mecanicas e reversiveis - recortar fundo, redimensionar
 * e compor sobre cores da paleta. Ver docs/BRAND.md e docs/PENDENCIAS.md.
 *
 * Uso: npm run brand:assets
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const BRAND = "public/brand";
const OUT = "public";

const OFF_WHITE = "#F4F3F0";

/* ------------------------------------------------------------------ */
/* 1. Recorte do fundo solido                                          */
/* ------------------------------------------------------------------ */

/**
 * Os arquivos de marca foram recortados de um brand board em JPEG, entao vem
 * com fundo solido quase branco em vez de transparencia. Sem isso, a logo
 * aparece dentro de um retangulo visivel sobre qualquer fundo da paleta.
 *
 * Aqui o fundo vira alpha. A forma da logo nao e tocada: calculamos a
 * opacidade pela distancia ate a cor de fundo e desfazemos a mistura
 * (unpremultiply) para recuperar a cor real da tinta nas bordas suavizadas.
 *
 * O histograma desses arquivos e nitidamente bimodal (fundo ~0, tinta >90 de
 * distancia, pouquissimos pixels no meio), entao o recorte sai limpo.
 */
const LIMITE_TRANSPARENTE = 12; // abaixo disso e fundo puro
const LIMITE_OPACO = 90; // acima disso e tinta pura

async function recortarFundo(nomeArquivo) {
  const origem = `${BRAND}/${nomeArquivo}.png`;
  const destino = `${BRAND}/${nomeArquivo}-transparente.png`;

  const { data, info } = await sharp(origem)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // A cor de fundo e estimada pelos quatro cantos da imagem.
  const canto = (x, y) => {
    const i = (y * width + x) * channels;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const cantos = [
    canto(0, 0),
    canto(width - 1, 0),
    canto(0, height - 1),
    canto(width - 1, height - 1),
  ];
  const fundo = [0, 1, 2].map((canal) =>
    Math.round(cantos.reduce((soma, c) => soma + c[canal], 0) / cantos.length),
  );

  const saida = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i += 1) {
    const o = i * channels;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];

    const distancia = Math.max(
      Math.abs(r - fundo[0]),
      Math.abs(g - fundo[1]),
      Math.abs(b - fundo[2]),
    );

    let alpha =
      (distancia - LIMITE_TRANSPARENTE) /
      (LIMITE_OPACO - LIMITE_TRANSPARENTE);
    alpha = Math.min(1, Math.max(0, alpha));

    const d = i * 4;
    if (alpha <= 0) {
      saida[d] = 0;
      saida[d + 1] = 0;
      saida[d + 2] = 0;
      saida[d + 3] = 0;
      continue;
    }

    // Desfaz a mistura com o fundo: cor = (observado - (1-a) * fundo) / a
    for (let canal = 0; canal < 3; canal += 1) {
      const observado = data[o + canal];
      const real = (observado - (1 - alpha) * fundo[canal]) / alpha;
      saida[d + canal] = Math.min(255, Math.max(0, Math.round(real)));
    }
    saida[d + 3] = Math.round(alpha * 255);
  }

  await sharp(saida, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(destino);

  return destino;
}

/* ------------------------------------------------------------------ */
/* 2. Favicons e imagem OG                                             */
/* ------------------------------------------------------------------ */

async function gerarIcones() {
  const simbolo = `${BRAND}/logo-simbolo-transparente.png`;

  async function gerarIcone(size, destino) {
    const marca = await sharp(simbolo)
      .resize({
        width: Math.round(size * 0.82),
        height: Math.round(size * 0.82),
        fit: "inside",
      })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 3,
        background: OFF_WHITE,
      },
    })
      .composite([{ input: marca, gravity: "centre" }])
      .png({ compressionLevel: 9 })
      .toFile(destino);
  }

  for (const size of [16, 32, 48, 192, 512]) {
    await gerarIcone(size, `${OUT}/icon-${size}.png`);
  }
  await gerarIcone(32, `${OUT}/icon.png`);
  await gerarIcone(180, `${OUT}/apple-icon.png`);
}

async function gerarOg() {
  // Logo com assinatura, ja sem fundo, centralizada sobre off-white.
  const logo = await sharp(`${BRAND}/logo-horizontal-tagline-transparente.png`)
    .resize({ width: 760, fit: "inside" })
    .toBuffer();

  await sharp({
    create: { width: 1200, height: 630, channels: 3, background: OFF_WHITE },
  })
    .composite([{ input: logo, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/og-image.png`);
}

/* ------------------------------------------------------------------ */

async function main() {
  await mkdir(OUT, { recursive: true });

  // So os arquivos usados sobre fundos claros precisam de transparencia.
  // As variantes de circulo, squircle, tile, badge e selo tem fundo proprio
  // de proposito e ficam como estao.
  const comFundoSolido = [
    "logo-horizontal",
    "logo-horizontal-tagline",
    "logo-vertical",
    "logo-simbolo",
  ];

  for (const nome of comFundoSolido) {
    const destino = await recortarFundo(nome);
    console.log(`fundo recortado: ${destino}`);
  }

  await gerarIcones();
  await gerarOg();

  console.log("Assets de marca gerados em public/.");
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
