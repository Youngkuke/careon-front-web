import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { APP_PATHS, PUBLIC_PAGES, SITE_ORIGIN } from '../src/seo/site.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const htmlFile = (path) => resolve(dist, path === '/' ? 'index.html' : `${path.slice(1)}.html`)

for (const page of PUBLIC_PAGES) {
  test(`built ${page.path}: readable HTML, metadata and valid local links/assets`, async () => {
    const html = await readFile(htmlFile(page.path), 'utf8')
    assert.match(html, /<html lang="ko">/)
    assert.ok(html.includes(`<title>${page.title}</title>`))
    assert.equal((html.match(/<title>/g) || []).length, 1)
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1)
    for (const copy of [...page.headline, page.subcopy]) assert.ok(html.includes(copy))
    assert.ok(html.includes('href="/start">시작하기</a>'))
    assert.ok(html.includes('href="/login">로그인</a>'))
    assert.doesNotMatch(html, /public-guide|<article|<footer|<nav/)
    assert.ok(html.includes(`rel="canonical" href="${SITE_ORIGIN}${page.path}"`))
    assert.match(html, /content="index,follow"/)
    assert.doesNotMatch(html, /noindex|<div id="root"><\/div>/)
    const data = JSON.parse(html.match(/application\/ld\+json">(.*?)<\/script>/s)[1])
    assert.equal(data['@context'], 'https://schema.org')
    for (const [, url] of html.matchAll(/(?:href|src)="([^"\s]+)"/g)) {
      if (url.startsWith('#')) {
        assert.ok(html.includes(`id="${url.slice(1)}"`), `Missing anchor ${url}`)
      } else if (url.startsWith('/') && !url.startsWith('//')) {
        const path = url.split(/[?#]/)[0]
        await access(path === '/' || !path.split('/').at(-1).includes('.') ? htmlFile(path) : resolve(dist, path.slice(1)))
      }
    }
  })
}

test('all ten topic pages retain the home layout and differ only in headline and subcopy', async () => {
  const sections = await Promise.all(PUBLIC_PAGES.map(async (page) => {
    const html = await readFile(htmlFile(page.path), 'utf8')
    let section = html.match(/<section class="onboarding-page">[\s\S]*?<\/section>/)?.[0]
    assert.ok(section, page.path)
    for (const [index, copy] of [...page.headline, page.subcopy].entries()) section = section.replace(copy, `COPY_${index}`)
    return section
  }))
  for (const section of sections) assert.equal(section, sections[0])
})

test('built private entries and 404 contain noindex, without public canonical URLs', async () => {
  for (const path of [...APP_PATHS, '/404']) {
    const html = await readFile(htmlFile(path), 'utf8')
    assert.match(html, /content="noindex,follow"/)
    assert.doesNotMatch(html, /rel="canonical"|application\/ld\+json/)
  }
})

test('sitemap contains only public URLs and robots allows reading noindex pages', async () => {
  const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8')
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])
  assert.deepEqual(locations, PUBLIC_PAGES.map((page) => `${SITE_ORIGIN}${page.path}`))
  assert.doesNotMatch(sitemap, /\/guides\//)
  const robots = await readFile(resolve(dist, 'robots.txt'), 'utf8')
  assert.ok(robots.includes(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`))
  assert.doesNotMatch(robots, /Disallow:/)
  await access(resolve(dist, 'og-careon.webp'))
})

test('Vercel serves real files and 404 instead of a catch-all homepage rewrite', async () => {
  const config = JSON.parse(await readFile(resolve(root, 'vercel.json'), 'utf8'))
  assert.equal(config.cleanUrls, true)
  assert.equal(config.trailingSlash, false)
  assert.equal(config.rewrites, undefined)
  const hostRule = config.headers.find((rule) => rule.has?.some((condition) => condition.type === 'host'))
  const previewHost = new RegExp(`^${hostRule.has[0].value}$`)
  assert.equal(previewHost.test('careon.site'), false)
  assert.equal(previewHost.test('careon-preview.vercel.app'), true)
})
