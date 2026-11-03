import { PageShell } from '../components/layout/PageShell'
import { OnboardingPage } from '../pages/OnboardingPage'
import { getPublicPage } from '../seo/site'
import '../App.css'

export function PublicApp({ path }) {
  const page = getPublicPage(path)
  return (
    <PageShell currentView="onboarding" homeHref="/">
      {page ? (
        <OnboardingPage copy={page} startHref="/start" loginHref="/login" />
      ) : (
        <section className="onboarding-page">
          <div className="hero-copy">
            <div className="hero-copy__intro">
              <h1>페이지를 찾을 수 없어요</h1>
              <p>주소를 확인하거나 처음 화면으로 돌아가주세요.</p>
            </div>
            <div className="hero-actions"><a className="button button--primary button--large" href="/">홈으로</a></div>
          </div>
        </section>
      )}
    </PageShell>
  )
}
