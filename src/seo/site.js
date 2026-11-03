export const SITE_ORIGIN = 'https://careon.site'

// Every entry uses the original onboarding layout; only its headline and subcopy vary.
export const PUBLIC_PAGES = [
  {
    path: '/',
    label: 'CareON 홈',
    title: 'CareON | 가족돌봄청년 맞춤 복지 지원 찾기',
    description: '가족을 돌보는 청년을 위한 CareON. 회원가입 없이 사전 진단을 시작하고 돌봄 상황에 맞는 지원금과 복지 제도를 찾아보세요.',
    headline: ['가족을 돌보고 있나요?', '저희가 도와드릴게요'],
    subcopy: '상황을 알려주시면, 필요한 지원을 받을 수 있게 도와드려요',
  },
  {
    path: '/money',
    label: '지원금',
    title: '가족돌봄청년 지원금·복지 혜택 찾기 | CareON',
    description: '가족돌봄청년 지원금과 복지 혜택을 찾고 있나요? CareON 사전 진단으로 돌봄 상황을 정리하고 내게 맞는 지원 제도를 찾아보세요.',
    headline: ['가족돌봄청년 지원금,', '내게 맞는 혜택을 찾아봐요'],
    subcopy: '돌봄 상황을 알려주시면, 생활에 보탬이 되는 지원을 함께 찾아드려요',
  },
  {
    path: '/care',
    label: '돌봄 지원',
    title: '가족 돌봄·간병·가사 지원 찾기 | CareON',
    description: '가족 돌봄, 간병, 가사 지원이 필요한 청년을 위한 CareON. 사전 진단으로 내 돌봄 상황에 맞는 복지 제도를 찾아보세요.',
    headline: ['가족 돌봄과 간병,', '혼자 감당하고 있나요?'],
    subcopy: '돌봄과 가사 부담을 나눌 수 있는 지원 제도를 함께 찾아드려요',
  },
  {
    path: '/medical',
    label: '의료비 지원',
    title: '가족돌봄청년 의료비·병원비 지원 찾기 | CareON',
    description: '가족의 의료비와 병원비가 부담되나요? CareON에서 돌봄 상황을 정리하고 관련 복지 지원 제도를 찾아보세요.',
    headline: ['가족의 의료비와 병원비,', '부담을 나눌 방법을 찾아봐요'],
    subcopy: '치료와 돌봄으로 어려운 상황에 맞는 지원 제도를 함께 살펴봐요',
  },
  {
    path: '/housing',
    label: '주거비 지원',
    title: '가족돌봄청년 주거비·월세 지원 찾기 | CareON',
    description: '가족을 돌보며 월세와 주거비가 걱정되나요? CareON 사전 진단으로 내 상황에 맞는 주거 관련 복지 지원을 찾아보세요.',
    headline: ['돌봄에 월세와 주거비까지,', '필요한 지원을 찾아봐요'],
    subcopy: '거주 상황과 생활의 어려움을 알려주시면, 관련 지원을 함께 살펴봐요',
  },
  {
    path: '/living',
    label: '생활비·생계 지원',
    title: '가족돌봄청년 생활비·생계 지원 찾기 | CareON',
    description: '가족 돌봄과 생계를 함께 책임지는 청년을 위한 CareON. 생활비 부담을 정리하고 내 상황에 맞는 복지 제도를 찾아보세요.',
    headline: ['가족 돌봄에 생활비까지,', '혼자 책임지고 있나요?'],
    subcopy: '돌봄과 생계를 함께 책임지는 상황에 맞춰 필요한 지원을 찾아드려요',
  },
  {
    path: '/mind',
    label: '심리상담 지원',
    title: '가족돌봄청년 심리상담·마음 건강 지원 찾기 | CareON',
    description: '가족 돌봄으로 마음이 지쳤다면 CareON에서 상황을 정리해보세요. 심리상담과 마음 건강에 도움이 되는 관련 지원을 찾아보세요.',
    headline: ['가족을 돌보느라 지친 마음,', '내 마음도 돌봐주세요'],
    subcopy: '돌봄으로 힘든 일상을 알려주시면, 마음 건강을 위한 지원을 함께 찾아봐요',
  },
  {
    path: '/young-carer',
    label: '영케어러 지원',
    title: '영케어러·가족돌봄청년 복지 지원 찾기 | CareON',
    description: '영케어러, 가족돌봄청년을 위한 맞춤 복지 지원 찾기. 가족을 돌보는 일상을 CareON 사전 진단으로 정리하고 필요한 지원을 살펴보세요.',
    headline: ['가족을 돌보는 청년,', '영케어러를 위한 지원을 찾아요'],
    subcopy: '학업과 일, 가족 돌봄을 함께하는 상황에 맞는 지원을 찾아드려요',
  },
  {
    path: '/eligibility',
    label: '지원 대상 확인',
    title: '가족돌봄청년 지원 대상·조건 사전 진단 | CareON',
    description: '가족돌봄청년 지원 대상인지 궁금한가요? CareON의 간단한 사전 진단으로 돌봄 상황을 정리하고 관련 복지 지원을 살펴보세요.',
    headline: ['가족돌봄청년 지원 대상,', '나도 해당하는지 궁금한가요?'],
    subcopy: '간단한 질문으로 돌봄 상황을 정리하고, 관련 지원 제도를 함께 살펴봐요',
  },
  {
    path: '/apply',
    label: '신청 방법',
    title: '가족돌봄청년 복지 지원·신청 방법 찾기 | CareON',
    description: '복지 지원 신청을 어디서부터 시작할지 막막한가요? CareON에서 관련 제도를 찾고 신청 방법과 준비할 내용을 확인해보세요.',
    headline: ['복지 지원 신청,', '어디서부터 시작할까요?'],
    subcopy: '내 상황에 맞는 제도를 찾고, 신청 방법과 준비할 내용을 함께 확인해봐요',
  },
  {
    path: '/documents',
    label: '신청 서류',
    title: '복지 지원 신청 서류·준비 방법 찾기 | CareON',
    description: '복지 지원 신청 서류와 준비 방법이 궁금한가요? CareON에서 내 상황에 맞는 제도를 찾고 해당 제도의 필요 서류와 준비 안내를 확인해보세요.',
    headline: ['복지 지원 신청 서류,', '무엇부터 준비해야 할까요?'],
    subcopy: '관련 제도를 찾은 뒤, 필요한 서류와 준비 방법을 차근차근 확인해봐요',
  },
]

export const APP_PATHS = ['/start', '/login', '/reset-password']

export function normalizePath(pathname) {
  return pathname.replace(/\/+$/, '') || '/'
}

export function getPublicPage(pathname) {
  return PUBLIC_PAGES.find((page) => page.path === normalizePath(pathname))
}

export function isAppLocation(pathname, search = '') {
  const params = new URLSearchParams(search)
  return APP_PATHS.includes(normalizePath(pathname)) || params.has('token') || params.has('resetToken')
}

export function getAppEntryView(pathname, search = '') {
  const path = normalizePath(pathname)
  const params = new URLSearchParams(search)
  if (path === '/reset-password' || params.has('token') || params.has('resetToken')) return 'passwordReset'
  if (path === '/login') return 'auth'
  if (path === '/start') return 'diagnosis'
  return 'onboarding'
}
