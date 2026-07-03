import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Cổng chạy local — đổi số ở đây nếu muốn cổng khác.
const PORT = 3000

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: PORT },   // npm run dev
  preview: { port: PORT },  // npm run preview
})
