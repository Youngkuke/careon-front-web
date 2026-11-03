import { Button } from '../components/common/Button'
import { getPublicPage } from '../seo/site'

export function OnboardingPage({ onStart, onLogin, copy = getPublicPage('/'), startHref, loginHref }) {
  return (
    <section className="onboarding-page">
      <div className="hero-copy">
        <div className="hero-copy__intro">
          <h1>{copy.headline[0]}<br />{copy.headline[1]}</h1>
          <p>{copy.subcopy}</p>
        </div>
        <div className="hero-actions">
          {startHref ? <a className="button button--primary button--large" href={startHref}>시작하기</a> : <Button size="large" onClick={onStart}>시작하기</Button>}
        </div>
        <p>회원가입 없이 바로 시작할 수 있어요</p>
        <div className="onboarding-login">
          <span>이미 계정이 있으신가요?</span>
          {loginHref ? <a className="text-button" href={loginHref}>로그인</a> : <button className="text-button" type="button" onClick={onLogin}>로그인</button>}
        </div>
      </div>
    </section>
  )
}
