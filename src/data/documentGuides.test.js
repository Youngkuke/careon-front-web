import assert from 'node:assert/strict'
import test from 'node:test'
import {
  classifyRequiredForm,
  getDocumentGuide,
  getRequiredFormGuide,
} from './documentGuides.js'

test('의료급여증은 병원이 아니라 정부24·시군구 발급으로 안내한다', () => {
  const guide = getDocumentGuide({ name: '의료급여증' })

  assert.equal(guide.preparationType, 'issue')
  assert.match(guide.issuer, /시·군·구/)
  assert.match(guide.actionUrl, /CappBizCD=14600000078/)
})

test('입양사실확인서는 관계 기관의 공식 안내로 연결한다', () => {
  const guide = getDocumentGuide({ name: '입양 사실 확인서' })

  assert.equal(guide.preparationType, 'request_from_official_agency')
  assert.match(guide.issuer, /아동권리보장원/)
  assert.match(guide.actionUrl, /ncrc\.or\.kr/)
})

test('신청서와 청구서는 분야 키워드보다 작성 양식으로 먼저 분류한다', () => {
  const formNames = [
    '의료급여 틀니 등록 신청서',
    '출산전후휴가 급여등 신청서',
    '보조기기 급여 지급청구서',
    '학교 밖 청소년 교육참여수당 신청서',
    '장애인활동지원 구비추가 지원 신청서 및 추천서',
  ]

  for (const name of formNames) {
    assert.equal(getDocumentGuide({ name }).preparationType, 'download_and_fill', name)
  }
})

test('구체적인 병원·회사·학교 발급 자료는 기존 유형 안내를 유지한다', () => {
  assert.equal(getDocumentGuide({ name: '진료비 세부내역서' }).preparationType, 'request_from_hospital')
  assert.equal(getDocumentGuide({ name: '급여명세서' }).preparationType, 'request_from_employer')
  assert.equal(getDocumentGuide({ name: '학교장 추천서' }).preparationType, 'request_from_school')
  assert.equal(getDocumentGuide({ name: '단체장 추천서' }).preparationType, 'unknown')
})

test('소득금액증명과 사업자등록증명 별칭을 공식 증명서 안내로 연결한다', () => {
  const incomeGuide = getDocumentGuide({ name: '소득금액증명원' })
  const businessGuide = getDocumentGuide({ name: '사업자등록 증명원' })

  assert.equal(incomeGuide.preparationType, 'issue')
  assert.match(incomeGuide.actionUrl, /CappBizCD=12100000021/)
  assert.equal(businessGuide.preparationType, 'issue')
  assert.match(businessGuide.actionUrl, /CappBizCD=12100000016/)
})

test('공식 발급 링크는 임의의 API URL로 덮어쓰지 않는다', () => {
  const guide = getDocumentGuide({
    name: '주민등록등본',
    url: 'https://example.com/not-an-official-certificate',
  })

  assert.match(guide.actionUrl, /CappBizCD=13100000015/)
})

test('검증된 공식 도메인의 양식 URL만 표시한다', () => {
  const officialGuide = getDocumentGuide({
    name: '출산전후휴가 급여등 신청서',
    url: 'https://www.bokjiro.go.kr/example-form.hwp',
  })
  const untrustedGuide = getDocumentGuide({
    name: '출산전후휴가 급여등 신청서',
    url: 'https://example.com/example-form.hwp',
  })

  assert.equal(officialGuide.actionUrl, 'https://www.bokjiro.go.kr/example-form.hwp')
  assert.equal(officialGuide.actionLabel, '공식 양식 보기')
  assert.equal(untrustedGuide.actionUrl, null)
})

test('관련 자료의 확인서는 신청 양식으로 단정하지 않는다', () => {
  assert.equal(classifyRequiredForm('처리 결과 확인서.pdf'), 'attachment')
  assert.equal(classifyRequiredForm('개인정보 동의서.hwp'), 'application_form')
  assert.equal(classifyRequiredForm('신청서 작성 지침.pdf'), 'reference')
})

test('관련 자료도 검증된 공식 URL만 버튼으로 표시한다', () => {
  const officialGuide = getRequiredFormGuide({
    name: '신청서.hwp',
    url: 'https://www.bokjiro.go.kr/application.hwp',
  })
  const untrustedGuide = getRequiredFormGuide({
    name: '신청서.hwp',
    url: 'https://example.com/application.hwp',
  })

  assert.equal(officialGuide.actionUrl, 'https://www.bokjiro.go.kr/application.hwp')
  assert.equal(untrustedGuide.actionUrl, null)
})
