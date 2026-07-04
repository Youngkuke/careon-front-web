import { useState } from 'react'
import { SEOUL_DISTRICTS } from '../constants/seoulDistricts'
import { DEFAULT_USER } from '../data/mockUser'
import { Button } from '../components/common/Button'
import { TextField } from '../components/common/TextField'

export function SignupPage({ onSubmit, onLogin }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    district: '',
    agreed: false,
  })

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const canSubmit = form.name && form.email && form.password && form.confirmPassword && form.district && form.agreed

  return (
    <section className="auth-page">
      <div className="auth-panel auth-panel--signup">
        <h1>회원가입</h1>
        <form
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault()
            if (!canSubmit) return
            onSubmit({
              ...DEFAULT_USER,
              name: form.name,
              email: form.email,
              district: form.district,
            })
          }}
        >
          <TextField label="이름 또는 닉네임" value={form.name} onChange={(event) => updateField('name', event.target.value)} />
          <TextField label="이메일" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
          <TextField label="비밀번호" type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} />
          <TextField
            label="비밀번호 확인"
            type="password"
            value={form.confirmPassword}
            onChange={(event) => updateField('confirmPassword', event.target.value)}
          />
          <label className="field">
            <span>거주 지역</span>
            <select value={form.district} onChange={(event) => updateField('district', event.target.value)}>
              <option value="">거주 지역을 선택해 주세요</option>
              {SEOUL_DISTRICTS.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              checked={form.agreed}
              onChange={(event) => updateField('agreed', event.target.checked)}
            />
            <span>이용약관 및 개인정보처리방침 동의 (필수)</span>
          </label>
          <div className="auth-actions">
            <Button size="large" className="full-width" type="submit" disabled={!canSubmit}>
              회원가입하기
            </Button>
            <Button variant="ghost" size="large" onClick={onLogin}>
              로그인으로
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
