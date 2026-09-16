import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base is relative so the build works from any static host (GitHub Pages,
// Netlify, Vercel, or opened straight from a local folder).
export default defineConfig({
  plugins: [react()],
  base: './'
})
