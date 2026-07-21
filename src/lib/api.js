import { SUPPORT_TYPES } from '../constants/supportTypes'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || API_BASE_URL
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

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

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

async function request(path, {
  method = 'GET',
  body,
  auth = false,
  baseUrl = API_BASE_URL,
} = {}) {
  const headers = {}
  const token = getAccessToken()

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await response.text()
  const data = parseJson(text)

  if (!response.ok) {
    throw new ApiError(resolveErrorMessage(data), response.status, data?.error)
  }

  return data
}

async function aiRequest(path, options = {}) {
  return request(path, { ...options, baseUrl: AI_API_BASE_URL })
}

function parseJson(text) {
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function compactObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined),
  )
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null)
}

function resolveErrorMessage(data) {
  return data?.message || '요청을 처리하지 못했어요.'
}

function toCsv(value) {
  return Array.isArray(value) ? value.join(',') : value
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    searchParams.set(key, toCsv(value))
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

function normalizeCared(item = {}) {
  return {
    caredId: firstDefined(item.cared_id, item.caredId),
    caredRelation: firstDefined(item.cared_relation, item.caredRelation),
    age: item.age,
    conditionSummary: firstDefined(item.condition_summary, item.conditionSummary),
    severityLevel: firstDefined(item.severity_level, item.severityLevel),
  }
}

function normalizeIncomeSignal(item = {}) {
  return {
    signalId: firstDefined(item.signal_id, item.signalId),
    signalType: firstDefined(item.signal_type, item.signalType),
    rawValue: firstDefined(item.raw_value, item.rawValue),
    parsedValue: firstDefined(item.parsed_value, item.parsedValue),
    source: item.source,
    confidence: item.confidence,
    contradictsSignalId: firstDefined(item.contradicts_signal_id, item.contradictsSignalId),
    contradictionResolved: firstDefined(item.contradiction_resolved, item.contradictionResolved),
    createdAt: firstDefined(item.created_at, item.createdAt),
  }
}

function normalizeDiagnosisProfile(item = {}) {
  return {
    ...item,
    carerId: firstDefined(item.carer_id, item.carerId),
    householdMembersCount: firstDefined(item.household_members_count, item.householdMembersCount),
    caredCount: firstDefined(item.cared_count, item.caredCount),
    diagnosisCompleted: firstDefined(item.diagnosis_completed, item.diagnosisCompleted),
    cared: firstDefined(item.cared, []).map(normalizeCared),
    incomeSignals: firstDefined(item.income_signals, item.incomeSignals, []).map(normalizeIncomeSignal),
  }
}

function normalizeChatSession(item = {}) {
  return {
    sessionId: firstDefined(item.session_id, item.sessionId),
    conversationStateId: firstDefined(item.conversation_state_id, item.conversationStateId),
    phase: item.phase,
    phaseLabel: resolveChatPhaseLabel(item.phase),
    currentPhase: firstDefined(item.current_phase, item.currentPhase),
    activePolicyId: firstDefined(item.active_policy_id, item.activePolicyId),
    message: item.message,
  }
}

function normalizeChatMessage(item = {}) {
  return {
    message: item.message,
    phase: item.phase,
    phaseLabel: resolveChatPhaseLabel(item.phase),
    currentPhase: firstDefined(item.current_phase, item.currentPhase),
    activePolicyId: firstDefined(item.active_policy_id, item.activePolicyId),
  }
}

function normalizeMatchResult(item = {}) {
  return {
    matchedPolicyId: firstDefined(item.matched_policy_id, item.matchedPolicyId),
    policyId: firstDefined(item.policy_id, item.policyId),
    matchGroup: firstDefined(item.match_group, item.matchGroup),
  }
}

function normalizeChatState(item = {}) {
  return {
    conversationStateId: firstDefined(item.conversation_state_id, item.conversationStateId),
    carerId: firstDefined(item.carer_id, item.carerId),
    phase: item.phase,
    phaseLabel: resolveChatPhaseLabel(item.phase),
    currentPhase: firstDefined(item.current_phase, item.currentPhase),
    activePolicyId: firstDefined(item.active_policy_id, item.activePolicyId),
    updatedAt: firstDefined(item.updated_at, item.updatedAt),
  }
}

function resolveChatPhaseLabel(phase) {
  if (phase === 'info_gathering') return '정보 수집'
  if (phase === 'ready_to_match') return '매칭 준비'
  if (phase === 'matching') return '매칭 중'
  if (phase === 'done') return '완료'
  return phase || ''
}

function normalizeDocument(item = {}) {
  return {
    documentId: firstDefined(item.document_id, item.documentId),
    documentName: firstDefined(item.document_name, item.documentName),
    issuers: firstDefined(item.issuers, []).map((issuer) => ({
      documentIssuerId: firstDefined(issuer.document_issuer_id, issuer.documentIssuerId),
      issuerName: firstDefined(issuer.issuer_name, issuer.issuerName),
      issuerSite: firstDefined(issuer.issuer_site, issuer.issuerSite),
    })),
    policies: firstDefined(item.policies, []),
  }
}

function normalizeDocumentHistory(item = {}) {
  return {
    historyId: firstDefined(item.history_id, item.historyId),
    carerId: firstDefined(item.carer_id, item.carerId),
    documentId: firstDefined(item.document_id, item.documentId),
    documentName: firstDefined(item.document_name, item.documentName),
    policyId: firstDefined(item.policy_id, item.policyId),
    policyName: firstDefined(item.policy_name, item.policyName),
    issuedDate: firstDefined(item.issued_date, item.issuedDate),
    validUntil: firstDefined(item.valid_until, item.validUntil),
    directUtter: firstDefined(item.direct_utter, item.directUtter),
    confirmedByUser: firstDefined(item.confirmed_by_user, item.confirmedByUser),
    createdAt: firstDefined(item.created_at, item.createdAt),
  }
}

function resolveTypeId(policyType) {
  const localType = SUPPORT_TYPES.find((type) => type.id === policyType)
  if (localType) return localType.id

  const numericType = Number(policyType)
  if (Number.isSafeInteger(numericType)) return typeByApiId[numericType] || DEFAULT_TYPE_ID

  const label = String(policyType || '')
  const match = typeByLabel.find(([, keywords]) => keywords.some((keyword) => label.includes(keyword)))
  return match?.[0] || DEFAULT_TYPE_ID
}

function normalizeDateLabel(value, fallback = '상시') {
  if (!value) return fallback
  return String(value).slice(0, 10)
}

function normalizeDocuments(documents = []) {
  return documents.map((document) => (
    typeof document === 'string'
      ? document
      : firstDefined(document.document_name, document.name, document.title)
  )).filter(Boolean)
}

function normalizePolicyId(value) {
  const numericId = Number(value)
  return Number.isSafeInteger(numericId) ? numericId : value
}

function normalizeUser(item = {}) {
  return {
    carerId: firstDefined(item.carer_id, item.carerId, item.id),
    name: item.name,
    email: item.email,
    region: item.region,
    diagnosisCompleted: firstDefined(item.diagnosis_completed, item.diagnosisCompleted),
    appInstalled: firstDefined(item.app_installed, item.appInstalled),
    installPromptCount: firstDefined(item.install_prompt_count, item.installPromptCount, 0),
    notificationEnabled: firstDefined(item.notification_enabled, item.notificationEnabled),
  }
}

function normalizeAppInstallStatus(item = {}) {
  return {
    message: item.message,
    appInstalled: firstDefined(item.app_installed, item.appInstalled),
    installPromptCount: firstDefined(item.install_prompt_count, item.installPromptCount),
  }
}

function normalizeAuthResponse(item = {}) {
  return {
    carerId: firstDefined(item.carer_id, item.carerId),
    accessToken: firstDefined(item.access_token, item.accessToken),
    diagnosisCompleted: firstDefined(item.diagnosis_completed, item.diagnosisCompleted),
  }
}

function normalizePolicyTypes(policyTypes = []) {
  return policyTypes.map((policyType) => ({
    policyTypeId: firstDefined(policyType.policy_type_id, policyType.policyTypeId),
    typeName: firstDefined(policyType.type_name, policyType.typeName),
  }))
}

function resolvePolicyType(item) {
  const policyTypes = firstDefined(item.policy_types, item.policyTypes, [])
  const firstPolicyType = Array.isArray(policyTypes) ? policyTypes[0] : null

  return resolveTypeId(firstDefined(
    item.policy_type_id,
    item.policyTypeId,
    item.policy_type_name,
    item.policyTypeName,
    item.policyType,
    item.type,
    firstPolicyType?.policy_type_id,
    firstPolicyType?.policyTypeId,
    firstPolicyType?.type_name,
    firstPolicyType?.typeName,
  ))
}

export function normalizePolicy(item) {
  const id = normalizePolicyId(firstDefined(item.policy_id, item.policyId, item.id))
  const documents = firstDefined(item.documents, item.required_documents, item.requiredDocuments, [])
  const deadline = firstDefined(item.application_deadline, item.applicationDeadline, item.deadline)
  const resultDate = firstDefined(item.result_date, item.resultDate, item.result_note, item.resultNote)
  const cost = firstDefined(item.cost, item.self_payment, item.selfPayment)
  const link = firstDefined(item.link, item.source_url, item.sourceUrl, item.url, '')

  return {
    id,
    type: resolvePolicyType(item),
    status: deadline ? '모집중' : '상시',
    title: firstDefined(item.policy_name, item.policyName, item.name, item.title),
    agency: firstDefined(item.agency_name, item.agencyName, item.organization, item.agency, item.contact, '담당 기관'),
    summary: firstDefined(item.summary, item.content, cost, '상세 내용을 확인해 주세요.'),
    period: firstDefined(item.support_period, item.supportPeriod, item.duration, '공식 안내 확인'),
    cost: cost || '공식 안내 확인',
    deadline: normalizeDateLabel(deadline),
    method: firstDefined(item.application_method, item.applicationMethod, '공식 안내 확인'),
    resultTime: normalizeDateLabel(resultDate, '공식 안내 확인'),
    documents: normalizeDocuments(documents),
    documentDetails: documents,
    documentGuide: normalizeDocuments(documents).length
      ? '필요 서류별 발급처를 확인해 주세요.'
      : '공식 안내에서 필요 서류를 확인해 주세요.',
    note: cost ? `본인 부담: ${cost}` : firstDefined(item.notes, '세부 조건은 공식 안내를 확인해 주세요.'),
    duplicateRule: firstDefined(item.duplication_restriction, item.duplicationRestriction, '중복 지원 가능 여부는 담당 기관에 확인해 주세요.'),
    url: link,
    savedPolicyId: firstDefined(item.saved_policy_id, item.savedPolicyId),
    matchedPolicyId: firstDefined(item.matched_policy_id, item.matchedPolicyId),
    matchGroup: firstDefined(item.match_group, item.matchGroup),
    wasBenefited: firstDefined(item.was_benefited, item.wasBenefited),
    category: item.category,
    policyTypes: normalizePolicyTypes(firstDefined(item.policy_types, item.policyTypes, [])),
  }
}

export function normalizeMatchedPolicyGroups(groups = []) {
  return groups.flatMap((group) => (
    group.policies || []
  ).map((policy) => normalizePolicy({
    ...policy,
    policy_type_id: firstDefined(policy.policy_type_id, group.policy_type_id, group.policyTypeId),
    policy_type_name: firstDefined(policy.policy_type_name, group.policy_type_name, group.type_name, group.policyTypeName),
  })))
}

export function selectedTypeIdsToApiIds(selectedTypes) {
  const ids = selectedTypes
    .map((typeId) => SUPPORT_TYPES.find((type) => type.id === typeId)?.apiId)
    .filter(Boolean)

  return ids.length ? ids : SUPPORT_TYPES.map((type) => type.apiId)
}

export const api = {
  login: async (payload) => normalizeAuthResponse(await request('/api/web/users/login', {
    method: 'POST',
    body: payload,
  })),
  signup: async (payload) => normalizeAuthResponse(await request('/api/web/users/register', {
    method: 'POST',
    body: compactObject({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      region: firstDefined(payload.region, payload.district),
      terms_agreed: firstDefined(payload.terms_agreed, payload.termsAgreed, payload.agreed),
      interest_policy_type_ids: firstDefined(payload.interest_policy_type_ids, payload.interestPolicyTypeIds),
    }),
  })),
  me: async () => normalizeUser(await request('/api/web/users/me', { auth: true })),
  updateMe: (payload) => request('/api/web/users/me', {
    method: 'PATCH',
    body: compactObject({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      region: payload.region,
      notification_enabled: firstDefined(payload.notification_enabled, payload.notificationEnabled),
    }),
    auth: true,
  }),
  withdraw: () => request('/api/web/users/me', { method: 'DELETE', auth: true }),
  updateAppInstallStatus: async (installed) => normalizeAppInstallStatus(await request('/api/web/users/me/app-install-status', {
    method: 'PATCH',
    body: { app_installed: installed },
    auth: true,
  })),
  sendPasswordResetLink: (email) => request('/api/web/users/password/reset-link', {
    method: 'POST',
    body: { email },
  }),
  getDiagnosisProfile: async () => normalizeDiagnosisProfile(await request('/api/web/users/me/diagnosis-profile', { auth: true })),
  updateDiagnosisProfile: (payload) => request('/api/web/users/me/diagnosis-profile', {
    method: 'PATCH',
    body: compactObject(payload),
    auth: true,
  }),
  addCared: (payload) => request('/api/web/users/me/cared', {
    method: 'POST',
    body: compactObject(payload),
    auth: true,
  }),
  updateCared: (caredId, payload) => request(`/api/web/users/me/cared/${caredId}`, {
    method: 'PATCH',
    body: compactObject(payload),
    auth: true,
  }),
  deleteCared: (caredId) => request(`/api/web/users/me/cared/${caredId}`, {
    method: 'DELETE',
    auth: true,
  }),
  getIncomeSignals: async () => (await request('/api/web/users/me/income-signals', { auth: true })).map(normalizeIncomeSignal),
  resolveIncomeSignal: (signalId, payload) => request(`/api/web/users/me/income-signals/${signalId}`, {
    method: 'PATCH',
    body: compactObject({
      contradiction_resolved: firstDefined(payload.contradiction_resolved, payload.contradictionResolved),
      parsed_value: firstDefined(payload.parsed_value, payload.parsedValue),
    }),
    auth: true,
  }),
  getAgencies: () => request('/api/web/agencies'),
  getAgency: (agencyId) => request(`/api/web/agencies/${agencyId}`),
  getPolicyTypes: async () => normalizePolicyTypes(await request('/api/web/policy-types')),
  getDocuments: async () => (await request('/api/web/documents')).map(normalizeDocument),
  getDocument: async (documentId) => normalizeDocument(await request(`/api/web/documents/${documentId}`)),
  getInterestPolicyTypes: async () => normalizePolicyTypes(await request('/api/web/users/me/interest-policy-types', { auth: true })),
  updateInterestPolicyTypes: (interestPolicyTypeIds) => request('/api/web/users/me/interest-policy-types', {
    method: 'PATCH',
    body: { interest_policy_type_ids: interestPolicyTypeIds },
    auth: true,
  }),
  getPolicies: (params = {}) => request(`/api/web/policies${buildQuery({
    category: params.category,
    policy_type_ids: firstDefined(params.policy_type_ids, params.policyTypeIds),
    agency_id: firstDefined(params.agency_id, params.agencyId),
    keyword: params.keyword,
  })}`),
  getAlternatives: (interestTypeIds) => request(
    `/api/web/policies/alternatives?interest_policy_type_ids=${encodeURIComponent(interestTypeIds.join(','))}`,
  ),
  getMatchedPolicies: () => request('/api/web/policies/matched', { auth: true }),
  getPolicyDetail: (policyId) => request(`/api/web/policies/${policyId}`),
  getSavedPolicies: () => request('/api/web/users/me/saved-policies', { auth: true }),
  savePolicy: (policyId) => request('/api/web/users/me/saved-policies', {
    method: 'POST',
    body: { policy_id: policyId },
    auth: true,
  }),
  cancelSavedPolicy: (savedPolicyId) => request(`/api/web/users/me/saved-policies/${savedPolicyId}`, {
    method: 'DELETE',
    auth: true,
  }),
  updateMatchedPolicyBenefit: (matchedPolicyId, wasBenefited) => request(`/api/web/users/me/matched-policies/${matchedPolicyId}`, {
    method: 'PATCH',
    body: { was_benefited: wasBenefited },
    auth: true,
  }),
  resetPassword: (payload) => request('/api/web/users/password/reset', {
    method: 'POST',
    body: compactObject({
      reset_token: firstDefined(payload.reset_token, payload.resetToken),
      new_password: firstDefined(payload.new_password, payload.newPassword),
    }),
  }),
  createChatSession: async (carerId) => normalizeChatSession(await aiRequest('/api/v1/chat/sessions', {
    method: 'POST',
    body: { carer_id: carerId },
    auth: true,
  })),
  sendChatMessage: async (sessionId, message) => normalizeChatMessage(await aiRequest(`/api/v1/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: { message },
    auth: true,
  })),
  matchChatSession: async (sessionId) => {
    const data = await aiRequest(`/api/v1/chat/sessions/${sessionId}/match`, {
      method: 'POST',
      auth: true,
    })

    return {
      matches: firstDefined(data?.matches, []).map(normalizeMatchResult),
    }
  },
  getChatState: async () => normalizeChatState(await aiRequest('/api/v1/chat/state', { auth: true })),
  resetChatState: () => aiRequest('/api/v1/chat/state', { method: 'DELETE', auth: true }),
  getPoliciesByIds: async (policyIds) => {
    const data = await aiRequest(
      `/api/v1/policies?ids=${encodeURIComponent(policyIds.join(','))}`,
      { auth: true },
    )

    return firstDefined(data?.policies, data, [])
  },
  translatePolicy: (policyId) => aiRequest(`/api/v1/policies/${policyId}/translate`, {
    method: 'POST',
    auth: true,
  }),
  getDocumentHistory: async () => (await request('/api/web/users/me/document-history', { auth: true })).map(normalizeDocumentHistory),
  addDocumentHistory: (payload) => request('/api/web/users/me/document-history', {
    method: 'POST',
    body: compactObject({
      document_id: firstDefined(payload.document_id, payload.documentId),
      policy_id: firstDefined(payload.policy_id, payload.policyId),
      issued_date: firstDefined(payload.issued_date, payload.issuedDate),
      valid_until: firstDefined(payload.valid_until, payload.validUntil),
      direct_utter: firstDefined(payload.direct_utter, payload.directUtter),
      confirmed_by_user: firstDefined(payload.confirmed_by_user, payload.confirmedByUser),
    }),
    auth: true,
  }),
  updateDocumentHistory: (historyId, payload) => request(`/api/web/users/me/document-history/${historyId}`, {
    method: 'PATCH',
    body: compactObject({
      issued_date: firstDefined(payload.issued_date, payload.issuedDate),
      valid_until: firstDefined(payload.valid_until, payload.validUntil),
      confirmed_by_user: firstDefined(payload.confirmed_by_user, payload.confirmedByUser),
    }),
    auth: true,
  }),
  deleteDocumentHistory: (historyId) => request(`/api/web/users/me/document-history/${historyId}`, {
    method: 'DELETE',
    auth: true,
  }),
}
