import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  outDir: "dist",
  format: ["esm"], // or ["cjs"] if needed
  target: "esnext",
  clean: true,
  external: [
    "@prisma/client",
    "@prisma/client/runtime",
    "@prisma/client/runtime/utils",
    "@prisma/client/runtime-library",
    "node:fs",
    "node:path",
    "node:os",
  ],
  dts: true,
});