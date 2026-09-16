import { defineConfig, type Plugin, type PreviewServer, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

function spaFallback(): Plugin {
  const rewrite = (req: { method?: string; url?: string }) => {
    const method = req.method ?? "GET";
    if (method !== "GET" && method !== "HEAD") return;
    const url = (req.url ?? "").split("?")[0] ?? "";
    if (
      url.startsWith("/@") ||
      url.startsWith("/src") ||
      url.startsWith("/node_modules") ||
      url.startsWith("/__") ||
      url.includes(".")
    ) {
      return;
    }
    req.url = "/index.html";
  };
  const attach = (server: ViteDevServer | PreviewServer) => {
    return () => {
      server.middlewares.use((req, _res, next) => {
        rewrite(req);
        next();
      });
    };
  };
  return {
    name: "spa-fallback",
    configureServer: attach,
    configurePreviewServer: attach
  };
}

export default defineConfig({
  appType: "spa",
  plugins: [react(), spaFallback()],
  resolve: {
    alias: {
      "@tokens": path.resolve(__dirname, "src/tokens"),
      "@foundation": path.resolve(__dirname, "src/foundation"),
      "@components": path.resolve(__dirname, "src/components"),
      "@icons": path.resolve(__dirname, "src/icons"),
      "@nav": path.resolve(__dirname, "src/nav"),
      "@identity": path.resolve(__dirname, "src/identity"),
      "@families": path.resolve(__dirname, "src/families"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@data": path.resolve(__dirname, "src/data"),
      "@state": path.resolve(__dirname, "src/state"),
      "@admin": path.resolve(__dirname, "src/admin"),
      "@companion": path.resolve(__dirname, "src/companion"),
      "@demo": path.resolve(__dirname, "src/demo")
    }
  },
  server: { host: "127.0.0.1", port: 5200, strictPort: true }
});
