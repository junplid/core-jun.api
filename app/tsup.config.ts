import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/infra/express/index.ts"],
  target: "node21",
  platform: "node",
  format: ["cjs"],
  sourcemap: false,
  minify: true,
  external: ["@prisma/client", ".prisma/client", "bcrypt"],
  dts: false,
  clean: true,
});
