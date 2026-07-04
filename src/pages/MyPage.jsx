import { useState } from 'react'
import { SEOUL_DISTRICTS } from '../constants/seoulDistricts'
import { TextField } from '../components/common/TextField'
import { Button } from '../components/common/Button'

export function MyPage({ user, savedPrograms, onUpdateUser, onLogout, onDeleteAccount, onLogin }) {
  const [form, setForm] = useState(user || { name: '', email: '', district: '', password: '', confirmPassword: '' })

  if (!user) {
    return (
      <section className="mypage">
        <div className="result-card">
          <span className="eyebrow">마이페이지</span>
          <h1>로그인 후 이용할 수 있어요.</h1>
          <p>저장한 제도와 거주 지역 정보를 관리하려면 먼저 로그인해 주세요.</p>
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

  return (
    <section className="mypage">
      <div className="mypage__panel">
        <span className="eyebrow">마이페이지</span>
        <h1>내 정보</h1>
        <div className="profile-form">
          <TextField label="이름 또는 닉네임" value={form.name} onChange={(event) => updateField('name', event.target.value)} />
          <TextField label="이메일" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} />
          <TextField label="비밀번호" type="password" value={form.password || ''} onChange={(event) => updateField('password', event.target.value)} />
          <TextField
            label="비밀번호 확인"
            type="password"
            value={form.confirmPassword || ''}
            onChange={(event) => updateField('confirmPassword', event.target.value)}
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
            <Button onClick={() => onUpdateUser(form)}>수정 저장</Button>
            <Button variant="secondary" onClick={onLogout}>로그아웃</Button>
            <Button variant="danger" onClick={onDeleteAccount}>회원 탈퇴</Button>
          </div>
        </div>
      </div>
      <div className="mypage__panel">
        <span className="eyebrow">저장한 제도</span>
        <h1>{savedPrograms.length}개</h1>
        <div className="saved-list">
          {savedPrograms.length ? (
            savedPrograms.map((program) => (
              <article key={program.id} className="saved-item">
                <strong>{program.title}</strong>
                <span>{program.deadline}</span>
              </article>
            ))
          ) : (
            <p className="empty-state">아직 저장한 제도가 없어요.</p>
          )}
        </div>
      </div>
    </section>
  )
}
