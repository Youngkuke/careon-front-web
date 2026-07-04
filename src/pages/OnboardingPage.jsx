import { Button } from '../components/common/Button'

export function OnboardingPage({ onStart, onLogin }) {
  return (
    <section className="onboarding-page">
      <div className="hero-copy">
        <h1>가족을 돌보고 있나요?<br />저희가 도와드릴게요</h1>
        <p>
          상황을 알려주시면, 필요한 지원을 받을 수 있게 도와드려요
        </p>
        <div className="hero-actions">
          <Button size="large" onClick={onStart}>시작하기</Button>
        </div>
        <button className="text-button" type="button" onClick={onLogin}>이미 계정이 있으신가요? 로그인</button>
      </div>
    </section>
  )
}
