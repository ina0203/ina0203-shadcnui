import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/ina0203-shadcnui/',   // ★ 중요
  plugins: [react()],
})
