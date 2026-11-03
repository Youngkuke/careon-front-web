import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { APP_PATHS, PUBLIC_PAGES, SITE_ORIGIN } from '../src/seo/site.js'
import { renderDocument, renderHead } from '../src/seo/metadata.js'
import { renderPublicPage } from '../dist-ssr/entry-public.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const template = await readFile(resolve(dist, 'index.html'), 'utf8')

for (const page of PUBLIC_PAGES) {
  const target = resolve(dist, page.path === '/' ? 'index.html' : `${page.path.slice(1)}.html`)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, renderDocument(template, renderPublicPage(page.path), renderHead(page.path)))
}

for (const path of APP_PATHS) {
  const content = '<noscript>사전 진단과 로그인에는 JavaScript가 필요합니다. <a href="/">CareON 공개 안내 보기</a></noscript>'
  await writeFile(resolve(dist, `${path.slice(1)}.html`), renderDocument(template, content, renderHead(path, { privatePage: true })))
}

await writeFile(resolve(dist, '404.html'), renderDocument(template, renderPublicPage('/404'), renderHead('/404')))
await copyFile(resolve(root, 'src/assets/care.webp'), resolve(dist, 'og-careon.webp'))
await writeFile(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`)
await writeFile(resolve(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PUBLIC_PAGES.map((page) => `  <url><loc>${SITE_ORIGIN}${page.path}</loc></url>`).join('\n')}\n</urlset>\n`)
await rm(resolve(root, 'dist-ssr'), { recursive: true, force: true })
console.log(`Prerendered ${PUBLIC_PAGES.length} public pages, ${APP_PATHS.length} noindex app entries, 404, robots.txt and sitemap.xml.`)
