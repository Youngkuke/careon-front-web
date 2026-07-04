import { Button } from '../common/Button'
import logoImg from '../../assets/logo.svg'

export function PageShell({ children, currentView, user, showSideChat, onToggleSideChat, onNavigate, onLogout }) {
  const showAccount = currentView === 'programs' && user
  const handleLogoClick = () => {
    onNavigate(user ? 'programs' : 'onboarding')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={handleLogoClick}>
          <img src={logoImg} alt="CareON" />
        </button>
        {showAccount ? (
          <div className="topbar__account">
            <Button variant="secondary" size="small" onClick={onToggleSideChat}>
              {showSideChat ? '채팅창 닫기' : '채팅창'}
            </Button>
            <Button variant="secondary" size="small" onClick={() => onNavigate('mypage')}>개인정보 수정</Button>
            <Button variant="ghost" size="small" onClick={onLogout}>로그아웃</Button>
          </div>
        ) : null}
      </header>
      <main>{children}</main>
    </div>
  )
}
