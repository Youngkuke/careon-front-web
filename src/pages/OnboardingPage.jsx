import { Button } from '../components/common/Button'

export function OnboardingPage({ onStart, onLogin }) {
  return (
    <section className="onboarding-page">
      <div className="hero-copy">
        <div className="hero-copy__intro">
          <h1>가족을 돌보고 있나요?<br />저희가 도와드릴게요</h1>
          <p>상황을 알려주시면, 필요한 지원을 받을 수 있게 도와드려요</p>
        </div>
        <div className="hero-actions">
          <Button size="large" onClick={onStart}>시작하기</Button>
        </div>
        <p>회원가입 없이 바로 시작할 수 있어요</p>
        <div className="onboarding-login">
          <span>이미 계정이 있으신가요?</span>
          <button className="text-button" type="button" onClick={onLogin}>로그인</button>
        </div>
      </div>
    </section>
  )
}
