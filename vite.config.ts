import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/hela-eats-frontend/",
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://hela-eats-backend-api.onrender.com",
        changeOrigin: true,
        secure: true,
      },
      "/auth": {
        target: "https://hela-eats-backend-api.onrender.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
