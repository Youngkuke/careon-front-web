import { useEffect, useState } from 'react'
import { SEOUL_DISTRICTS } from '../constants/seoulDistricts'
import { SUPPORT_TYPES } from '../constants/supportTypes'
import { TextField } from '../components/common/TextField'
import { Button } from '../components/common/Button'
import { api } from '../lib/api'

const createProfileForm = (user) => ({
  name: user?.name || '',
  email: user?.email || '',
  district: user?.district || user?.region || '',
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})

const createDiagnosisForm = (profile) => ({
  age: profile?.age || '',
  household_members_count: profile?.household_members_count || profile?.householdMembersCount || '',
  cared_count: profile?.cared_count || profile?.caredCount || '',
  housing_type: profile?.housing_type || '',
  income_value: profile?.income_value || '',
  has_basic_livelihood_support: profile?.has_basic_livelihood_support || false,
  has_cha_sang_wi: profile?.has_cha_sang_wi || false,
})

const createCaredForm = () => ({
  cared_relation: '',
  age: '',
  condition_summary: '',
  severity_level: '',
})

const createHistoryForm = () => ({
  documentId: '',
  policyId: '',
  issuedDate: '',
  validUntil: '',
})

export function MyPage({ user, error, onUpdateUser, onLogout, onDeleteAccount, onLogin }) {
  const [form, setForm] = useState(() => createProfileForm(user))
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [dataError, setDataError] = useState('')
  const [dataMessage, setDataMessage] = useState('')
  const [diagnosisProfile, setDiagnosisProfile] = useState(null)
  const [diagnosisForm, setDiagnosisForm] = useState(createDiagnosisForm)
  const [caredForm, setCaredForm] = useState(createCaredForm)
  const [editingCaredId, setEditingCaredId] = useState(null)
  const [incomeSignals, setIncomeSignals] = useState([])
  const [policyTypes, setPolicyTypes] = useState([])
  const [interestPolicyTypeIds, setInterestPolicyTypeIds] = useState([])
  const [agencies, setAgencies] = useState([])
  const [agencyDetail, setAgencyDetail] = useState(null)
  const [documents, setDocuments] = useState([])
  const [documentDetail, setDocumentDetail] = useState(null)
  const [documentHistory, setDocumentHistory] = useState([])
  const [historyForm, setHistoryForm] = useState(createHistoryForm)

  useEffect(() => {
    let ignore = false

    const loadUserData = async () => {
      if (!user) return

      try {
        const [
          profile,
          signals,
          types,
          interests,
          agencyList,
          documentList,
          histories,
        ] = await Promise.all([
          api.getDiagnosisProfile().catch(() => null),
          api.getIncomeSignals().catch(() => []),
          api.getPolicyTypes().catch(() => []),
          api.getInterestPolicyTypes().catch(() => []),
          api.getAgencies().catch(() => []),
          api.getDocuments().catch(() => []),
          api.getDocumentHistory().catch(() => []),
        ])

        if (ignore) return

        setDiagnosisProfile(profile)
        setDiagnosisForm(createDiagnosisForm(profile))
        setIncomeSignals(signals)
        setPolicyTypes(types)
        setInterestPolicyTypeIds(interests.map((item) => item.policyTypeId).filter(Boolean))
        setAgencies(agencyList)
        setDocuments(documentList)
        setDocumentHistory(histories)
      } catch (requestError) {
        if (!ignore) {
          setDataError(requestError.message)
        }
      }
    }

    loadUserData()

    return () => {
      ignore = true
    }
  }, [user])

  if (!user) {
    return (
      <section className="mypage">
        <div className="result-card">
          <span className="eyebrow">마이페이지</span>
          <h1>로그인 후 이용할 수 있어요.</h1>
          <p>이름, 비밀번호, 거주 지역 정보를 관리하려면 먼저 로그인해 주세요.</p>
          <Button size="large" onClick={onLogin}>
            로그인하기
          </Button>
        </div>
      </section>
    )
  }

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setFormError('')
    setSuccessMessage('')
  }

  const updateDiagnosisField = (field, value) => {
    setDiagnosisForm((current) => ({ ...current, [field]: value }))
    setDataError('')
    setDataMessage('')
  }

  const updateCaredField = (field, value) => {
    setCaredForm((current) => ({ ...current, [field]: value }))
    setDataError('')
    setDataMessage('')
  }

  const updateHistoryField = (field, value) => {
    setHistoryForm((current) => ({ ...current, [field]: value }))
    setDataError('')
    setDataMessage('')
  }

  const refreshDocumentHistory = async () => {
    setDocumentHistory(await api.getDocumentHistory())
  }

  const handleSaveDiagnosisProfile = async () => {
    setDataError('')
    setDataMessage('')

    try {
      await api.updateDiagnosisProfile({
        ...diagnosisForm,
        age: diagnosisForm.age ? Number(diagnosisForm.age) : undefined,
        household_members_count: diagnosisForm.household_members_count ? Number(diagnosisForm.household_members_count) : undefined,
        cared_count: diagnosisForm.cared_count ? Number(diagnosisForm.cared_count) : undefined,
        income_value: diagnosisForm.income_value ? Number(diagnosisForm.income_value) : undefined,
      })
      const profile = await api.getDiagnosisProfile()
      setDiagnosisProfile(profile)
      setDiagnosisForm(createDiagnosisForm(profile))
      setDataMessage('진단 프로필이 저장되었어요.')
    } catch (requestError) {
      setDataError(requestError.message)
    }
  }

  const handleSaveCared = async () => {
    setDataError('')
    setDataMessage('')

    try {
      const payload = {
        ...caredForm,
        age: caredForm.age ? Number(caredForm.age) : undefined,
      }
      if (editingCaredId) {
        await api.updateCared(editingCaredId, payload)
      } else {
        await api.addCared(payload)
      }
      const profile = await api.getDiagnosisProfile()
      setDiagnosisProfile(profile)
      setCaredForm(createCaredForm())
      setEditingCaredId(null)
      setDataMessage(editingCaredId ? '돌봄 대상자가 수정되었어요.' : '돌봄 대상자가 추가되었어요.')
    } catch (requestError) {
      setDataError(requestError.message)
    }
  }

  const handleEditCared = (cared) => {
    setEditingCaredId(cared.caredId)
    setCaredForm({
      cared_relation: cared.caredRelation || '',
      age: cared.age || '',
      condition_summary: cared.conditionSummary || '',
      severity_level: cared.severityLevel || '',
    })
    setDataError('')
    setDataMessage('')
  }

  const handleDeleteCared = async (caredId) => {
    setDataError('')
    setDataMessage('')

    try {
      await api.deleteCared(caredId)
      const profile = await api.getDiagnosisProfile()
      setDiagnosisProfile(profile)
      setDataMessage('돌봄 대상자가 삭제되었어요.')
    } catch (requestError) {
      setDataError(requestError.message)
    }
  }

  const handleResolveIncomeSignal = async (signal) => {
    setDataError('')
    setDataMessage('')

    try {
      await api.resolveIncomeSignal(signal.signalId, {
        contradictionResolved: true,
        parsedValue: signal.parsedValue,
      })
      setIncomeSignals(await api.getIncomeSignals())
      setDataMessage('소득 추론 근거를 확인 처리했어요.')
    } catch (requestError) {
      setDataError(requestError.message)
    }
  }

  const handleToggleInterest = (policyTypeId) => {
    setInterestPolicyTypeIds((current) => (
      current.includes(policyTypeId)
        ? current.filter((id) => id !== policyTypeId)
        : [...current, policyTypeId]
    ))
  }

  const handleSaveInterests = async () => {
    setDataError('')
    setDataMessage('')

    try {
      await api.updateInterestPolicyTypes(interestPolicyTypeIds)
      setDataMessage('관심 유형이 저장되었어요.')
    } catch (requestError) {
      setDataError(requestError.message)
    }
  }

  const handleLoadAgency = async (agencyId) => {
    setDataError('')

    if (!agencyId) {
      setAgencyDetail(null)
      return
    }

    try {
      setAgencyDetail(await api.getAgency(agencyId))
    } catch (requestError) {
      setAgencyDetail(null)
      setDataError(requestError.message)
    }
  }

  const handleLoadDocument = async (documentId) => {
    setDataError('')

    if (!documentId) {
      setDocumentDetail(null)
      return
    }

    try {
      setDocumentDetail(await api.getDocument(documentId))
    } catch (requestError) {
      setDocumentDetail(null)
      setDataError(requestError.message)
    }
  }

  const handleAddDocumentHistory = async () => {
    setDataError('')
    setDataMessage('')

    try {
      await api.addDocumentHistory({
        documentId: Number(historyForm.documentId),
        policyId: Number(historyForm.policyId),
        issuedDate: historyForm.issuedDate || undefined,
        validUntil: historyForm.validUntil || undefined,
        directUtter: false,
        confirmedByUser: true,
      })
      setHistoryForm(createHistoryForm())
      await refreshDocumentHistory()
      setDataMessage('서류 이력이 저장되었어요.')
    } catch (requestError) {
      setDataError(requestError.message)
    }
  }

  const handleConfirmDocumentHistory = async (historyId) => {
    setDataError('')
    setDataMessage('')

    try {
      await api.updateDocumentHistory(historyId, { confirmedByUser: true })
      await refreshDocumentHistory()
      setDataMessage('서류 이력을 확인 처리했어요.')
    } catch (requestError) {
      setDataError(requestError.message)
    }
  }

  const handleDeleteDocumentHistory = async (historyId) => {
    setDataError('')
    setDataMessage('')

    try {
      await api.deleteDocumentHistory(historyId)
      await refreshDocumentHistory()
      setDataMessage('서류 이력이 삭제되었어요.')
    } catch (requestError) {
      setDataError(requestError.message)
    }
  }

  const handleSubmit = async () => {
    if (!form.currentPassword) {
      setFormError('정보를 저장하려면 현재 비밀번호를 입력해 주세요.')
      return
    }

    if (form.newPassword !== form.confirmNewPassword) {
      setFormError('새 비밀번호가 일치하지 않아요.')
      return
    }

    const updated = await onUpdateUser(form)
    if (!updated) return

    setSuccessMessage('정보가 저장되었어요.')
    setForm((current) => ({
      ...current,
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    }))
  }

  return (
    <section className="mypage">
      <div className="mypage__panel">
        <span className="eyebrow">마이페이지</span>
        <h1>내 정보</h1>
        <div className="profile-form">
          <TextField label="이름 또는 닉네임" value={form.name} onChange={(event) => updateField('name', event.target.value)} />
          <TextField label="이메일" type="email" value={form.email} disabled />
          <TextField
            label="현재 비밀번호"
            type="password"
            value={form.currentPassword}
            onChange={(event) => updateField('currentPassword', event.target.value)}
            autoComplete="current-password"
          />
          <TextField
            label="새 비밀번호"
            type="password"
            value={form.newPassword}
            onChange={(event) => updateField('newPassword', event.target.value)}
            autoComplete="new-password"
          />
          <TextField
            label="새 비밀번호 확인"
            type="password"
            value={form.confirmNewPassword}
            onChange={(event) => updateField('confirmNewPassword', event.target.value)}
            helperText={form.newPassword === form.confirmNewPassword ? '' : '새 비밀번호가 일치하지 않아요.'}
            helperTone="error"
            autoComplete="new-password"
          />
          <label className="field">
            <span>거주 지역</span>
            <select value={form.district || ''} onChange={(event) => updateField('district', event.target.value)}>
              <option value="">거주 지역을 선택해 주세요</option>
              {SEOUL_DISTRICTS.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </label>
          <div className="profile-actions">
            <Button onClick={handleSubmit}>수정 저장</Button>
            <Button variant="secondary" onClick={onLogout}>로그아웃</Button>
            <Button variant="danger" onClick={onDeleteAccount}>회원 탈퇴</Button>
          </div>
          {formError || error ? <p className="form-error">{formError || error}</p> : null}
          {successMessage ? <p className="form-success">{successMessage}</p> : null}
        </div>
      </div>
      <div className="mypage__panel mypage__panel--wide">
        <span className="eyebrow">데이터 관리</span>
        <h1>진단과 서류</h1>
        {dataError ? <p className="form-error">{dataError}</p> : null}
        {dataMessage ? <p className="form-success">{dataMessage}</p> : null}

        <section className="management-section">
          <h2>진단 프로필</h2>
          <div className="management-grid">
            <TextField label="나이" type="number" value={diagnosisForm.age} onChange={(event) => updateDiagnosisField('age', event.target.value)} />
            <TextField label="가구원 수" type="number" value={diagnosisForm.household_members_count} onChange={(event) => updateDiagnosisField('household_members_count', event.target.value)} />
            <TextField label="돌봄 대상자 수" type="number" value={diagnosisForm.cared_count} onChange={(event) => updateDiagnosisField('cared_count', event.target.value)} />
            <TextField label="주거 형태" value={diagnosisForm.housing_type} onChange={(event) => updateDiagnosisField('housing_type', event.target.value)} />
            <TextField label="월 소득" type="number" value={diagnosisForm.income_value} onChange={(event) => updateDiagnosisField('income_value', event.target.value)} />
          </div>
          <div className="inline-form">
            <label className="inline-check">
              <input type="checkbox" checked={diagnosisForm.has_basic_livelihood_support} onChange={(event) => updateDiagnosisField('has_basic_livelihood_support', event.target.checked)} />
              <span>기초생활수급</span>
            </label>
            <label className="inline-check">
              <input type="checkbox" checked={diagnosisForm.has_cha_sang_wi} onChange={(event) => updateDiagnosisField('has_cha_sang_wi', event.target.checked)} />
              <span>차상위</span>
            </label>
            <Button type="button" onClick={handleSaveDiagnosisProfile}>진단 프로필 저장</Button>
          </div>
        </section>

        <section className="management-section">
          <h2>돌봄 대상자</h2>
          <div className="management-grid">
            <TextField label="관계" value={caredForm.cared_relation} onChange={(event) => updateCaredField('cared_relation', event.target.value)} />
            <TextField label="나이" type="number" value={caredForm.age} onChange={(event) => updateCaredField('age', event.target.value)} />
            <TextField label="상태 요약" value={caredForm.condition_summary} onChange={(event) => updateCaredField('condition_summary', event.target.value)} />
            <TextField label="중증도" value={caredForm.severity_level} onChange={(event) => updateCaredField('severity_level', event.target.value)} />
          </div>
          <div className="inline-form">
            <Button type="button" variant="secondary" onClick={handleSaveCared}>
              {editingCaredId ? '대상자 수정' : '대상자 추가'}
            </Button>
            {editingCaredId ? (
              <Button type="button" variant="ghost" onClick={() => {
                setEditingCaredId(null)
                setCaredForm(createCaredForm())
              }}>
                수정 취소
              </Button>
            ) : null}
          </div>
          <div className="data-list">
            {(diagnosisProfile?.cared || []).map((cared) => (
              <div className="data-list__item" key={cared.caredId}>
                <span>{cared.caredRelation || '관계 미입력'} · {cared.age || '-'}세 · {cared.severityLevel || '상태 미입력'}</span>
                <div className="item-actions">
                  <Button type="button" variant="secondary" size="small" onClick={() => handleEditCared(cared)}>수정</Button>
                  <Button type="button" variant="danger" size="small" onClick={() => handleDeleteCared(cared.caredId)}>삭제</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="management-section">
          <h2>소득 추론 근거</h2>
          <div className="data-list">
            {incomeSignals.length ? incomeSignals.map((signal) => (
              <div className="data-list__item" key={signal.signalId}>
                <span>{signal.rawValue || signal.signalType} · {signal.parsedValue || '-'} · {signal.confidence || '확신도 없음'}</span>
                <Button type="button" variant="secondary" size="small" onClick={() => handleResolveIncomeSignal(signal)}>확인</Button>
              </div>
            )) : <p className="empty-state">소득 추론 근거가 없어요.</p>}
          </div>
        </section>

        <section className="management-section">
          <h2>관심 유형</h2>
          <div className="chip-grid">
            {(policyTypes.length ? policyTypes : SUPPORT_TYPES.map((type) => ({ policyTypeId: type.apiId, typeName: type.label }))).map((type) => (
              <label className="inline-check" key={type.policyTypeId}>
                <input
                  type="checkbox"
                  checked={interestPolicyTypeIds.includes(type.policyTypeId)}
                  onChange={() => handleToggleInterest(type.policyTypeId)}
                />
                <span>{type.typeName}</span>
              </label>
            ))}
          </div>
          <Button type="button" onClick={handleSaveInterests}>관심 유형 저장</Button>
        </section>

        <section className="management-section">
          <h2>기준 데이터</h2>
          <div className="management-grid">
            <label className="field">
              <span>기관</span>
              <select value={agencyDetail?.agency_id || ''} onChange={(event) => handleLoadAgency(event.target.value)}>
                <option value="">기관 선택</option>
                {agencies.map((agency) => (
                  <option key={agency.agency_id} value={agency.agency_id}>{agency.agency_name}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>서류</span>
              <select value={documentDetail?.documentId || ''} onChange={(event) => handleLoadDocument(event.target.value)}>
                <option value="">서류 선택</option>
                {documents.map((document) => (
                  <option key={document.documentId} value={document.documentId}>{document.documentName}</option>
                ))}
              </select>
            </label>
          </div>
          {agencyDetail ? <p className="info-box">{agencyDetail.agency_name} 연결 제도 {agencyDetail.policies?.length || 0}개</p> : null}
          {documentDetail ? <p className="info-box">{documentDetail.documentName} 발급처 {documentDetail.issuers?.length || 0}곳</p> : null}
        </section>

        <section className="management-section">
          <h2>서류 이력</h2>
          <div className="management-grid">
            <TextField label="서류 ID" type="number" value={historyForm.documentId} onChange={(event) => updateHistoryField('documentId', event.target.value)} />
            <TextField label="제도 ID" type="number" value={historyForm.policyId} onChange={(event) => updateHistoryField('policyId', event.target.value)} />
            <TextField label="발급일" value={historyForm.issuedDate} onChange={(event) => updateHistoryField('issuedDate', event.target.value)} placeholder="YYYY-MM-DD" />
            <TextField label="유효기간" value={historyForm.validUntil} onChange={(event) => updateHistoryField('validUntil', event.target.value)} placeholder="YYYY-MM-DD" />
          </div>
          <Button type="button" variant="secondary" onClick={handleAddDocumentHistory}>서류 이력 저장</Button>
          <div className="data-list">
            {documentHistory.length ? documentHistory.map((history) => (
              <div className="data-list__item" key={history.historyId}>
                <span>{history.documentName || `서류 ${history.documentId}`} · {history.policyName || `제도 ${history.policyId}`} · {history.validUntil || '유효기간 미입력'}</span>
                <div className="item-actions">
                  <Button type="button" variant="secondary" size="small" onClick={() => handleConfirmDocumentHistory(history.historyId)}>확인</Button>
                  <Button type="button" variant="danger" size="small" onClick={() => handleDeleteDocumentHistory(history.historyId)}>삭제</Button>
                </div>
              </div>
            )) : <p className="empty-state">저장된 서류 이력이 없어요.</p>}
          </div>
        </section>
      </div>
    </section>
  )
}
