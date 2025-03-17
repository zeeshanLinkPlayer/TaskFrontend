import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path'; // ✅ Use 'node:path' instead of 'path'
import { fileURLToPath } from 'node:url'; // ✅ Use 'node:url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
