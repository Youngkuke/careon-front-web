import { useState } from 'react'
import { Button } from '../components/common/Button'
import { TextField } from '../components/common/TextField'

const readResetToken = () => {
  const params = new URLSearchParams(window.location.search)
  return params.get('resetToken') || params.get('token') || ''
}

export function PasswordResetPage({ onSendResetLink, onResetPassword, onBack, onComplete }) {
  const [email, setEmail] = useState('')
  const [resetToken] = useState(readResetToken)
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [sent, setSent] = useState(false)
  const [resetComplete, setResetComplete] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const passwordMatches = !passwordForm.confirmPassword || passwordForm.newPassword === passwordForm.confirmPassword

  const updatePasswordField = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }))
  }

  if (resetComplete) {
    return (
      <section className="auth-page">
        <div className="auth-panel">
          <h1>비밀번호 재설정 완료</h1>
          <div className="password-result">
            <p>비밀번호가 재설정되었어요. 새 비밀번호로 로그인해 주세요.</p>
            <Button size="large" onClick={onComplete}>로그인으로 돌아가기</Button>
          </div>
        </div>
      </section>
    )
  }

  if (resetToken) {
    const canSubmit = passwordForm.newPassword && passwordForm.confirmPassword && passwordMatches

    return (
      <section className="auth-page">
        <div className="auth-panel">
          <h1>새 비밀번호 설정</h1>
          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault()
              if (!canSubmit) return
              setLoading(true)
              setError('')
              onResetPassword({
                resetToken,
                newPassword: passwordForm.newPassword,
              })
                .then(() => setResetComplete(true))
                .catch((requestError) => setError(requestError.message))
                .finally(() => setLoading(false))
            }}
          >
            <TextField
              label="새 비밀번호"
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => updatePasswordField('newPassword', event.target.value)}
              placeholder="영문과 숫자를 포함해 8~20자"
            />
            <TextField
              label="새 비밀번호 확인"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => updatePasswordField('confirmPassword', event.target.value)}
              helperText={passwordMatches ? '' : '비밀번호가 일치하지 않아요.'}
            />
            <div className="auth-actions">
              <Button size="large" className="full-width" type="submit" disabled={!canSubmit || loading}>
                {loading ? '변경 중...' : '비밀번호 변경하기'}
              </Button>
              <Button variant="ghost" size="large" onClick={onBack}>로그인으로</Button>
            </div>
            {error ? <p className="form-error">{error}</p> : null}
          </form>
        </div>
      </section>
    )
  }

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <h1>비밀번호 찾기</h1>
        {sent ? (
          <div className="password-result">
            <p>입력한 이메일로 비밀번호 재설정 안내를 보냈어요.</p>
            <Button size="large" onClick={onComplete}>로그인으로 돌아가기</Button>
          </div>
        ) : (
          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault()
              setLoading(true)
              setError('')
              onSendResetLink(email)
                .then(() => setSent(true))
                .catch((requestError) => setError(requestError.message))
                .finally(() => setLoading(false))
            }}
          >
            <TextField
              label="이메일"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="가입한 이메일을 입력해 주세요"
            />
            <div className="auth-actions">
              <Button size="large" className="full-width" type="submit" disabled={loading}>
                {loading ? '발송 중...' : '재설정 링크 받기'}
              </Button>
              <Button variant="ghost" size="large" onClick={onBack}>로그인으로</Button>
            </div>
            {error ? <p className="form-error">{error}</p> : null}
          </form>
        )}
      </div>
    </section>
  )
}
