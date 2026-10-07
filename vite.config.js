import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function renderSpaFallbackPlugin() {
  return {
    name: 'render-spa-fallback',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist')
      const indexHtmlPath = path.resolve(distDir, 'index.html')
      if (fs.existsSync(indexHtmlPath)) {
        const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8')

        // 1. Render serves 404.html on static sites when path is not matched
        fs.writeFileSync(path.resolve(distDir, '404.html'), indexHtml)

        // 2. Pre-create index.html in every known SPA route folder
        // This ensures Render Static Site web server directly serves the route with 200 OK
        const routes = ['tables', 'games', 'practice', 'results', 'written-math']
        routes.forEach(route => {
          const routeDir = path.resolve(distDir, route)
          if (!fs.existsSync(routeDir)) {
            fs.mkdirSync(routeDir, { recursive: true })
          }
          fs.writeFileSync(path.resolve(routeDir, 'index.html'), indexHtml)
        })
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    renderSpaFallbackPlugin(),
  ],
})
