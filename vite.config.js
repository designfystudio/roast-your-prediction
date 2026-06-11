import fs from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Dev-only convenience: serve /api/* from `npm run dev` by adapting the real
// Vercel handlers onto Vite's connect server. `vercel dev` remains the
// canonical way to test serverless routes.
function apiRoutes() {
  return {
    name: 'dev-api-routes',
    configureServer(server) {
      for (const route of ['/api/roast', '/api/excuse']) {
        server.middlewares.use(route, async (req, res) => {
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          try {
            req.body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : undefined
          } catch {
            req.body = undefined
          }
          res.status = (code) => ((res.statusCode = code), res)
          res.json = (obj) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(obj))
            return res
          }
          const { default: handler } = await server.ssrLoadModule(`${route}.js`)
          await handler(req, res)
        })
      }

      // Dev-only test sink: the ?cardtest=1 page POSTs the exported share-card
      // PNG here so headless test runs can write it to disk. Never in prod.
      server.middlewares.use('/api/dev/save-card', async (req, res) => {
        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        const { dataUrl } = JSON.parse(Buffer.concat(chunks).toString())
        fs.mkdirSync('tmp', { recursive: true })
        fs.writeFileSync('tmp/share-card-test.png', Buffer.from(dataUrl.split(',')[1], 'base64'))
        res.end('saved')
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Make .env.local's ANTHROPIC_API_KEY visible to the dev middleware (Vite only
  // exposes VITE_-prefixed vars by default; the key must NOT get that prefix).
  process.env.ANTHROPIC_API_KEY ??= loadEnv(mode, process.cwd(), '').ANTHROPIC_API_KEY
  return {
    plugins: [react(), tailwindcss(), apiRoutes()],
  }
})
