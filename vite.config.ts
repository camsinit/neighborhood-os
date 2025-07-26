
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Add CORS configuration to prevent issues
    cors: {
      origin: true,
      credentials: true
    },
    // Improve error handling
    hmr: {
      overlay: false // Disable error overlay that might cause loops
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
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
  // Add error handling for development
  optimizeDeps: {
    exclude: ['@lovable/tagger'] // Exclude tagger from optimization to prevent issues
  }
}));
