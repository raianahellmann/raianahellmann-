import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const proxy = {
    "/api": {
      target:
        env.API_PROXY_TARGET || "http://api-segunda-fase.pontosat.net.br:29461",
      changeOrigin: true,
    },
  };
  return { plugins: [react()], server: { proxy }, preview: { proxy } };
});
