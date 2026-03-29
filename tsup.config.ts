import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],  // main server file
  format: ["esm"],           // Node18+ ESM
  target: "node18",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  splitting: false,          // backend এ splitting দরকার নেই
  bundle: true,              // 🔹 তুমি চাইছ bundle
  external: [
    "@prisma/client",        // Prisma must stay external
    ".prisma/client"         // Prisma generated client
  ],
  banner: {
    js: `
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    `
  }
});