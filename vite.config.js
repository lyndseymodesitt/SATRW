import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/SATRW/",
  define: {
    __BUILD_ID__: JSON.stringify(Date.now()),   // 👈 unique each build
  },
});
