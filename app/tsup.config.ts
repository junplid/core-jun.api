import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/infra/express/index.ts"],
    target: "node21",
    platform: "node",
    format: ["cjs"],
    sourcemap: false,
    minify: true,
    external: ["@prisma/client", ".prisma/client", "bcrypt"],
    dts: false,
    clean: true,
  },
  {
    entry: ["prisma/seed.ts"],
    outDir: "prisma", // => gera prisma/seed.js
    target: "node21",
    platform: "node",
    format: ["cjs"],
    sourcemap: false,
    minify: true,
    external: ["@prisma/client"],
    dts: false,
    clean: false, // não apaga a pasta dist recém-criada
  },
]);
