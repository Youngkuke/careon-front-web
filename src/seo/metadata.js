import { getPublicPage, SITE_ORIGIN } from './site.js'

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
}

export function renderHead(path, { privatePage = false } = {}) {
  const page = privatePage ? null : getPublicPage(path)
  const title = page?.title || (privatePage ? '사전 진단·맞춤 복지 지원 찾기 | CareON' : '페이지를 찾을 수 없어요 | CareON')
  const description = page?.description || 'CareON에서 가족돌봄청년의 돌봄 상황을 정리하고 필요한 복지 지원을 찾아보세요.'
  const canonical = page ? `${SITE_ORIGIN}${page.path}` : null
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="robots" content="${page ? 'index,follow' : 'noindex,follow'}" />`,
    '<meta property="og:locale" content="ko_KR" />',
    '<meta property="og:site_name" content="CareON" />',
    '<meta property="og:type" content="website" />',
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:image" content="${SITE_ORIGIN}/og-careon.webp" />`,
    '<meta property="og:image:alt" content="CareON 가족돌봄청년 복지 지원 안내" />',
    '<meta name="twitter:card" content="summary" />',
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${SITE_ORIGIN}/og-careon.webp" />`,
  ]
  if (canonical) {
    tags.push(`<link rel="canonical" href="${escapeHtml(canonical)}" />`)
    tags.push(`<meta property="og:url" content="${escapeHtml(canonical)}" />`)
    const data = page.path === '/' ? {
      '@context': 'https://schema.org', '@type': 'WebSite', name: 'CareON', alternateName: '케어온', url: canonical, inLanguage: 'ko-KR', description,
    } : {
      '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: canonical, inLanguage: 'ko-KR',
      isPartOf: { '@type': 'WebSite', name: 'CareON', url: `${SITE_ORIGIN}/` },
    }
    tags.push(`<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`)
  }
  return tags.join('\n    ')
}

export function renderDocument(template, content, head) {
  if (!template.includes('<!--seo:start-->') || !template.includes('<div id="root"></div>')) {
    throw new Error('SEO HTML template markers are missing')
  }
  return template
    .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, () => `<!--seo:start-->\n    ${head}\n    <!--seo:end-->`)
    .replace('<div id="root"></div>', () => `<div id="root">${content}</div>`)
}
