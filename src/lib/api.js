import { SUPPORT_TYPES } from '../constants/supportTypes'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const TOKEN_KEY = 'careon:webAccessToken'

const DEFAULT_TYPE_ID = SUPPORT_TYPES[0]?.id || 'living'

const typeByApiId = SUPPORT_TYPES.reduce((map, type) => {
  map[type.apiId] = type.id
  return map
}, {})

const typeByLabel = [
  ['living', ['생계', '주거', '월세', '생활']],
  ['care', ['돌봄', '가사', '간병', '가족']],
  ['medical', ['의료', '건강', '진료']],
  ['mental', ['심리', '마음', '청년']],
]

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
    return
  }
  localStorage.removeItem(TOKEN_KEY)
}

export function clearAccessToken() {
  setAccessToken(null)
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {}
  const token = getAccessToken()

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = data?.message || '요청을 처리하지 못했어요.'
    throw new Error(message)
  }

  return data
}

function resolveTypeId(policyType) {
  if (typeof policyType === 'number') return typeByApiId[policyType] || DEFAULT_TYPE_ID
  const label = String(policyType || '')
  const match = typeByLabel.find(([, keywords]) => keywords.some((keyword) => label.includes(keyword)))
  return match?.[0] || DEFAULT_TYPE_ID
}

function normalizeDateLabel(value, fallback = '상시') {
  return value || fallback
}

function normalizeDocuments(documents = []) {
  return documents.map((document) => (
    typeof document === 'string'
      ? document
      : document.name
  )).filter(Boolean)
}

export function normalizePolicy(item) {
  const id = item.policyId ?? item.id
  return {
    id,
    type: resolveTypeId(item.policyType ?? item.policyTypeId),
    status: item.deadline ? '모집중' : '상시',
    title: item.name ?? item.title,
    agency: item.organization ?? item.agency ?? item.contact ?? '담당 기관',
    summary: item.content ?? item.summary ?? item.selfPayment ?? '상세 내용을 확인해 주세요.',
    period: item.supportPeriod ?? item.duration ?? '공식 안내 확인',
    cost: item.selfPayment ?? '공식 안내 확인',
    deadline: normalizeDateLabel(item.deadline),
    method: item.applicationMethod ?? '공식 안내 확인',
    resultTime: normalizeDateLabel(item.resultDate, '공식 안내 확인'),
    documents: normalizeDocuments(item.documents),
    documentDetails: item.documents || [],
    documentGuide: normalizeDocuments(item.documents).length
      ? '필요 서류별 발급처를 확인해 주세요.'
      : '공식 안내에서 필요 서류를 확인해 주세요.',
    note: item.selfPayment ? `본인 부담: ${item.selfPayment}` : '세부 조건은 공식 안내를 확인해 주세요.',
    duplicateRule: '중복 지원 가능 여부는 담당 기관에 확인해 주세요.',
    url: item.sourceUrl || item.url || '',
    savedPolicyId: item.savedPolicyId,
  }
}

export function selectedTypeIdsToApiIds(selectedTypes) {
  const ids = selectedTypes
    .map((typeId) => SUPPORT_TYPES.find((type) => type.id === typeId)?.apiId)
    .filter(Boolean)

  return ids.length ? ids : SUPPORT_TYPES.map((type) => type.apiId)
}

export const api = {
  login: (payload) => request('/api/web/users/login', { method: 'POST', body: payload }),
  signup: (payload) => request('/api/web/users/register', { method: 'POST', body: payload }),
  me: () => request('/api/web/users/me', { auth: true }),
  updateMe: (payload) => request('/api/web/users/me', { method: 'PATCH', body: payload, auth: true }),
  withdraw: () => request('/api/web/users/me', { method: 'DELETE', auth: true }),
  updateAppInstallStatus: (installed) => request('/api/web/users/me/app-install-status', {
    method: 'PATCH',
    body: { installed },
    auth: true,
  }),
  sendPasswordResetLink: (email) => request('/api/web/users/password/reset-link', {
    method: 'POST',
    body: { email },
  }),
  getAlternatives: (interestTypeIds) => request(
    `/api/web/policies/alternatives?interestTypeIds=${encodeURIComponent(interestTypeIds.join(','))}`,
  ),
  getPolicyDetail: (policyId) => request(`/api/web/policies/${policyId}`),
  getSavedPolicies: () => request('/api/web/users/me/saved-policies', { auth: true }),
  savePolicy: (policyId) => request('/api/web/users/me/saved-policies', {
    method: 'POST',
    body: { policyId },
    auth: true,
  }),
  cancelSavedPolicy: (savedPolicyId) => request(`/api/web/users/me/saved-policies/${savedPolicyId}`, {
    method: 'DELETE',
    auth: true,
  }),
}
