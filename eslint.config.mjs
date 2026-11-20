import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    /*
      Pastas de ferramentas de agente (Windsurf, Cursor, Roo, Warp, Trae,
      Kiro e companhia). Cada uma guarda a propria copia dos mesmos scripts
      .cjs, e juntas somavam centenas de erros que nao sao do projeto -
      o `npm run lint` deixava de servir para achar problema de verdade.
      O codigo do site continua sendo verificado normalmente.
    */
    ".agents/**",
    ".augment/**",
    ".claude/**",
    ".codebuddy/**",
    ".codewhale/**",
    ".continue/**",
    ".cursor/**",
    ".factory/**",
    ".gemini/**",
    ".github/**",
    ".kilocode/**",
    ".kiro/**",
    ".opencode/**",
    ".qoder/**",
    ".roo/**",
    ".trae/**",
    ".warp/**",
    ".windsurf/**",
    "design-system/**",
  ]),
]);

export default eslintConfig;
