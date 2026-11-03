import assert from 'node:assert/strict'
import test from 'node:test'
import { APP_PATHS, getAppEntryView, getPublicPage, isAppLocation, normalizePath, PUBLIC_PAGES } from './site.js'
import { renderDocument, renderHead } from './metadata.js'

test('the original home copy and ten topic variants have unique addresses and metadata', () => {
  assert.equal(PUBLIC_PAGES.length, 11)
  assert.deepEqual(getPublicPage('/').headline, ['가족을 돌보고 있나요?', '저희가 도와드릴게요'])
  assert.equal(getPublicPage('/').subcopy, '상황을 알려주시면, 필요한 지원을 받을 수 있게 도와드려요')
  for (const field of ['path', 'title', 'description']) {
    assert.equal(new Set(PUBLIC_PAGES.map((page) => page[field])).size, PUBLIC_PAGES.length)
  }
  assert.equal(normalizePath('/money/'), '/money')
  assert.equal(getPublicPage('/care/').path, '/care')
  assert.equal(getPublicPage('/guides/documents'), undefined)
  assert.equal(getPublicPage('/not-a-real-page'), undefined)
})

test('private entries and legacy reset links are separated from topic landings', () => {
  for (const path of APP_PATHS) assert.equal(isAppLocation(path), true)
  for (const page of PUBLIC_PAGES) assert.equal(isAppLocation(page.path), false)
  assert.equal(isAppLocation('/', '?token=example'), true)
  assert.equal(isAppLocation('/', '?resetToken=example'), true)
  assert.equal(isAppLocation('/', '?utm_source=search'), false)
})

test('start and login links enter their intended screens without another onboarding step', () => {
  assert.equal(getAppEntryView('/start'), 'diagnosis')
  assert.equal(getAppEntryView('/login'), 'auth')
  assert.equal(getAppEntryView('/start/'), 'diagnosis')
  assert.equal(getAppEntryView('/reset-password/'), 'passwordReset')
  assert.equal(getAppEntryView('/', '?token=example'), 'passwordReset')
  assert.equal(getAppEntryView('/money', '?resetToken=example'), 'passwordReset')
})

test('only public pages get indexable metadata and canonical URLs', () => {
  for (const page of PUBLIC_PAGES) {
    const head = renderHead(page.path)
    assert.match(head, /content="index,follow"/)
    assert.ok(head.includes(`href="https://careon.site${page.path}"`))
    const data = JSON.parse(head.match(/application\/ld\+json">(.*?)<\/script>/s)[1])
    assert.ok(['WebSite', 'WebPage'].includes(data['@type']))
  }
  for (const path of [...APP_PATHS, '/unknown']) {
    const head = renderHead(path)
    assert.match(head, /content="noindex,follow"/)
    assert.doesNotMatch(head, /rel="canonical"|application\/ld\+json/)
  }
})

test('prerendering preserves literal dollar sequences in content and rejects invalid templates', () => {
  const template = '<html><!--seo:start--><!--seo:end--><div id="root"></div></html>'
  const output = renderDocument(template, '<p>$&</p>', '<title>$&</title>')
  assert.ok(output.includes('<p>$&</p>'))
  assert.ok(output.includes('<title>$&</title>'))
  assert.throws(() => renderDocument('<html></html>', '', ''), /markers/)
})
