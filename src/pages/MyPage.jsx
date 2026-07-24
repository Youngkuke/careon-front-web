import { useState } from 'react'
import { SEOUL_DISTRICTS } from '../constants/seoulDistricts'
import { TextField } from '../components/common/TextField'
import { Button } from '../components/common/Button'

const createProfileForm = (user) => ({
  name: user?.name || '',
  email: user?.email || '',
  district: user?.district || user?.region || '',
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})

export function MyPage({ user, error, onUpdateUser, onDeleteAccount, onLogin, onBack }) {
  const [form, setForm] = useState(() => createProfileForm(user))
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

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
          {formError || error ? <p className="form-error">{formError || error}</p> : null}
          {successMessage ? <p className="form-success">{successMessage}</p> : null}
        </div>
      </div>
    </section>
  )
}
