import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";


export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist", // output to dist/ (so backend serves it)
    emptyOutDir: true, // clean old build
    sourcemap: false, // don’t include sourcemaps in prod
  },
  
  server: {
    port: 5173, // frontend dev port
    open: true, // open browser automatically on dev
  },
});
