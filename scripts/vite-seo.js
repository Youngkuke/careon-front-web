import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { APP_PATHS, getPublicPage, isAppLocation, normalizePath } from '../src/seo/site.js'
import { renderHead } from '../src/seo/metadata.js'

// Production uses Vercel's clean URLs; mirror their HTML entry points locally.
export function seoPages() {
  return {
    name: 'careon-seo-pages',
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        if (!context.server) return html
        const url = new URL(context.originalUrl || context.path, 'http://localhost')
        const head = renderHead(normalizePath(url.pathname), { privatePage: isAppLocation(url.pathname, url.search) })
        return html.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, () => `<!--seo:start-->\n${head}\n<!--seo:end-->`)
      },
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url, 'http://localhost')
        const path = normalizePath(url.pathname)
        if (getPublicPage(path) || APP_PATHS.includes(path)) request.url = `/index.html${url.search}`
        // Development pages are never intended for indexing.
        response.setHeader('X-Robots-Tag', 'noindex, nofollow')
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (request, response, next) => {
        try {
          const url = new URL(request.url, 'http://localhost')
          const path = normalizePath(url.pathname)
          response.setHeader('X-Robots-Tag', 'noindex, nofollow')
          if (getPublicPage(path) || APP_PATHS.includes(path)) return next()
          if (path.startsWith('/assets/') || ['/favicon.svg', '/robots.txt', '/sitemap.xml', '/og-careon.webp'].includes(path)) return next()
          if (path.endsWith('.html') && (getPublicPage(path.slice(0, -5)) || APP_PATHS.includes(path.slice(0, -5)) || path === '/index.html')) {
            response.writeHead(308, { Location: `${path === '/index.html' ? '/' : path.slice(0, -5)}${url.search}` })
            return response.end()
          }
          const html = await readFile(resolve(server.config.root, server.config.build.outDir, '404.html'))
          response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
          response.end(request.method === 'HEAD' ? undefined : html)
        } catch (error) {
          next(error)
        }
      })
    },
  }
}
