import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import { RootApp } from './RootApp'
import { getPublicPage, isAppLocation, normalizePath } from './seo/site'

const root = document.getElementById('root')
const path = normalizePath(window.location.pathname)
const privatePage = isAppLocation(path, window.location.search)

// Legacy password reset links may arrive on the public home URL.
if (privatePage || !getPublicPage(path)) {
  document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex,follow')
  document.querySelector('link[rel="canonical"]')?.remove()
  document.querySelector('meta[property="og:url"]')?.remove()
  document.querySelector('script[type="application/ld+json"]')?.remove()
  document.title = privatePage ? '사전 진단·맞춤 복지 지원 찾기 | CareON' : '페이지를 찾을 수 없어요 | CareON'
}

const content = (
  <StrictMode>
    <RootApp path={path} privatePage={privatePage} />
  </StrictMode>
)

if (!privatePage && root.hasChildNodes()) {
  hydrateRoot(root, content)
} else {
  createRoot(root).render(content)
}
