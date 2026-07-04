import { useState } from 'react'
import { Button } from '../components/common/Button'
import { TextField } from '../components/common/TextField'

export function PasswordResetPage({ onBack, onComplete }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

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
              setSent(true)
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
              <Button size="large" className="full-width" type="submit">재설정 링크 받기</Button>
              <Button variant="ghost" size="large" onClick={onBack}>로그인으로</Button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
