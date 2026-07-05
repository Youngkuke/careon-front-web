import { useState } from 'react'
import { DEFAULT_USER } from '../data/mockUser'
import { Button } from '../components/common/Button'
import { TextField } from '../components/common/TextField'

export function AuthPage({ onSubmit, onSkip, onFindPassword }) {
  const [form, setForm] = useState({
    email: DEFAULT_USER.email,
    password: 'careon-demo',
  })

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <h1>로그인</h1>
        <form
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit({
              ...DEFAULT_USER,
              email: form.email,
            })
          }}
        >
          <TextField label="이메일" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
          <TextField
            label="비밀번호"
            type="password"
            value={form.password}
            onChange={(event) => updateField('password', event.target.value)}
          />
          <div className="auth-actions">
            <Button size="large" className="full-width" type="submit">
              로그인하기
            </Button>
            <Button variant="ghost" size="large" onClick={onSkip}>
              메인으로
            </Button>
          </div>
          <button className="text-button text-button--right" type="button" onClick={onFindPassword}>
            비밀번호 찾기
          </button>
        </form>
      </div>
    </section>
  )
}
