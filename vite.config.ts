// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Deployment target: Vercel. Inside Lovable's own build the preset is forced
  // to Cloudflare, so this only affects external CI builds (e.g. Vercel).
  nitro: { preset: "vercel" },
  vite: {
    build: {
      rollupOptions: {
        external: ["@coinbase/cdp-sdk", "@x402/evm"],
        onwarn(warning, warn) {
          if (warning.code === "MISSING_EXPORT") return;
          warn(warning);
        },
      },
    },
    optimizeDeps: {
      exclude: ["@coinbase/cdp-sdk", "@x402/evm"],
    },
  },
});
