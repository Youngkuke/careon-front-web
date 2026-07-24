import { useState } from 'react'
import { Button } from '../components/common/Button'
import { TextField } from '../components/common/TextField'

export function AuthPage({ error, loading = false, onSubmit, onSkip, onFindPassword }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
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
            onSubmit(form)
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
            <Button size="large" className="full-width" type="submit" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </Button>
            <Button variant="ghost" size="large" onClick={onSkip}>
              메인으로
            </Button>
          </div>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="text-button text-button--right" type="button" onClick={onFindPassword}>
            비밀번호 찾기
          </button>
        </form>
      </div>
    </section>
  )
}
