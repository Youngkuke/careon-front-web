import { useState } from 'react'
import { SEOUL_DISTRICTS } from '../constants/seoulDistricts'
import { TextField } from '../components/common/TextField'
import { Button } from '../components/common/Button'
import { Modal } from '../components/common/Modal'

const createProfileForm = (user) => ({
  name: user?.name || '',
  email: user?.email || '',
  district: user?.district || user?.region || '',
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})

export function MyPage({ user, onUpdateUser, onDeleteAccount, onLogin, onBack }) {
  const [form, setForm] = useState(() => createProfileForm(user))
  const [saveResult, setSaveResult] = useState(null)

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
  }

  const handleSubmit = async () => {
    if (!form.currentPassword) {
      setSaveResult({ type: 'error', message: '정보를 저장하려면 현재 비밀번호를 입력해 주세요.' })
      return
    }

    if (form.newPassword !== form.confirmNewPassword) {
      setSaveResult({ type: 'error', message: '새 비밀번호가 일치하지 않아요.' })
      return
    }

    const changes = [
      form.name !== user.name ? { label: '이름 또는 닉네임', before: user.name, after: form.name } : null,
      form.district !== user.region ? { label: '거주 지역', before: user.region, after: form.district } : null,
      form.newPassword ? { label: '비밀번호' } : null,
    ].filter(Boolean)

    if (!changes.length) {
      setSaveResult({ type: 'error', message: '변경된 정보가 없어요. 수정할 항목을 확인해 주세요.' })
      return
    }

    const result = await onUpdateUser(form)
    if (!result?.success) {
      setSaveResult({ type: 'error', message: result.message || '정보를 저장하지 못했어요.' })
      return
    }

    setSaveResult({ type: 'success', changes })
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
        <div className="mypage__topbar">
          <h2>마이페이지</h2>
          <Button variant="ghost" size="small" onClick={onBack}>뒤로가기</Button>
        </div>
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
            <Button variant="danger" onClick={onDeleteAccount}>회원 탈퇴</Button>
          </div>
        </div>
      </div>
      <Modal
        open={Boolean(saveResult)}
        title={saveResult?.type === 'success' ? '정보를 저장했어요' : '정보를 저장하지 못했어요'}
        primaryLabel={saveResult?.type === 'success' ? '마이페이지에 남기' : '확인'}
        secondaryLabel={saveResult?.type === 'success' ? '맞춤 제도 보러가기' : undefined}
        className={`profile-save-result-modal profile-save-result-modal--${saveResult?.type || 'error'}`}
        onPrimary={() => setSaveResult(null)}
        onSecondary={saveResult?.type === 'success' ? onBack : undefined}
      >
        {saveResult?.type === 'success' ? (
          <>
            <p>다음 정보를 변경했어요.</p>
            <ul className="profile-save-result__changes">
              {saveResult.changes.map((change) => (
                <li key={change.label}>
                  <strong>{change.label}</strong>
                  {change.before !== undefined ? <span>{change.before || '미입력'} → {change.after || '미입력'}</span> : null}
                </li>
              ))}
            </ul>
          </>
        ) : <p>{saveResult?.message}</p>}
      </Modal>
    </section>
  )
}
