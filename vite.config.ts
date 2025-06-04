
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Only enable component tagger in development mode and ensure it's properly configured
    mode === 'development' && process.env.NODE_ENV === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Disable unnecessary development features that might cause network requests
  define: {
    __DEV__: mode === 'development',
  },
  // Optimize build to prevent development tools from being included
  build: {
    sourcemap: false, // Disable sourcemaps to prevent debugging tool interference
    minify: true, // Use default minifier instead of terser
    rollupOptions: {
      output: {
        manualChunks: undefined, // Let Vite handle chunking automatically
      },
    },
  },
}));
