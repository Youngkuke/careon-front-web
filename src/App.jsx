import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { REQUIRED_DIAGNOSIS_IDS } from './constants/diagnosisQuestions'
import { MOCK_PROGRAMS } from './data/mockPrograms'
import { DEFAULT_USER } from './data/mockUser'
import { Modal } from './components/common/Modal'
import { PageShell } from './components/layout/PageShell'
import { AuthPage } from './pages/AuthPage'
import { DiagnosisPage } from './pages/DiagnosisPage'
import { FollowupQuestionPage } from './pages/FollowupQuestionPage'
import { MyPage } from './pages/MyPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { PasswordResetPage } from './pages/PasswordResetPage'
import { ProgramChatPage } from './pages/ProgramChatPage'
import { ProgramDetailPage } from './pages/ProgramDetailPage'
import { ProgramListPage } from './pages/ProgramListPage'
import { ResultPage } from './pages/ResultPage'
import { SignupPage } from './pages/SignupPage'
import endLoadingImg from './assets/endloading.webp'
import startLoadingImg from './assets/startloading.webp'

const FOLLOWUP_PENDING_KEY = 'careon:followupPending'
const FOLLOWUP_COMPLETED_KEY = 'careon:followupCompleted'

function AnalyzingPage({ complete }) {
  return (
    <section className="flow-page">
      <div className="flow-card analyzing-card">
        <div className={`loading-spinner ${complete ? 'is-complete' : ''}`} aria-hidden="true">
          <svg className="loading-spinner__ring" viewBox="0 0 120 120">
            <circle className="loading-spinner__track" cx="60" cy="60" r="51" />
            <circle className="loading-spinner__progress" cx="60" cy="60" r="51" />
          </svg>
          <img className="loading-spinner__icon" src={complete ? endLoadingImg : startLoadingImg} alt="" />
        </div>
        <h1 className="analyzing-message">
          작성해주신 소중한 답변을 바탕으로,<br />
          지금 가장 필요한 도움을 분석하고 있어요
        </h1>
      </div>
    </section>
  )
}

const readSessionTypes = () => {
  try {
    return JSON.parse(sessionStorage.getItem('careon:selectedTypes') || '[]')
  } catch {
    return []
  }
}

const shouldShowFollowupFirst = () => (
  localStorage.getItem(FOLLOWUP_PENDING_KEY) === 'true'
  && localStorage.getItem(FOLLOWUP_COMPLETED_KEY) !== 'true'
)

function App() {
  const [view, setView] = useState('onboarding')
  const [answers, setAnswers] = useState({})
  const [selectedTypes, setSelectedTypes] = useState(readSessionTypes)
  const [user, setUser] = useState(null)
  const [savedProgramIds, setSavedProgramIds] = useState([])
  const [activeProgramId, setActiveProgramId] = useState(null)
  const [installPromptSkipCount, setInstallPromptSkipCount] = useState(0)
  const [installPromptInstalled, setInstallPromptInstalled] = useState(false)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [showSideChat, setShowSideChat] = useState(true)
  const [authNextView, setAuthNextView] = useState('programs')
  const [analyzingNextView, setAnalyzingNextView] = useState('result')
  const [analyzingComplete, setAnalyzingComplete] = useState(false)

  const eligible = REQUIRED_DIAGNOSIS_IDS.every((id) => answers[id] === true)
  const activeProgram = MOCK_PROGRAMS.find((program) => program.id === activeProgramId)
  const selectedPrograms = useMemo(() => {
    const types = selectedTypes.length ? selectedTypes : ['living', 'care', 'medical', 'mental']
    return MOCK_PROGRAMS.filter((program) => types.includes(program.type))
  }, [selectedTypes])
  const savedPrograms = MOCK_PROGRAMS.filter((program) => savedProgramIds.includes(program.id))

  useEffect(() => {
    if (view !== 'analyzing') return undefined

    const completeTimer = window.setTimeout(() => {
      setAnalyzingComplete(true)
    }, 2000)

    const timer = window.setTimeout(() => {
      setView(analyzingNextView)
    }, 3000)

    return () => {
      window.clearTimeout(completeTimer)
      window.clearTimeout(timer)
    }
  }, [analyzingNextView, view])

  const navigate = (nextView) => {
    if (nextView === 'programs' && !user) {
      setView('auth')
      return
    }

    if (nextView === 'programs' && shouldShowFollowupFirst()) {
      setView('followup')
      return
    }

    if (nextView === 'programs') {
      setActiveProgramId(null)
    }
    setView(nextView)
  }

  const handleAnswer = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }))
  }

  const handleToggleType = (typeId) => {
    setSelectedTypes((current) => {
      const next = current.includes(typeId)
        ? current.filter((id) => id !== typeId)
        : [...current, typeId]
      sessionStorage.setItem('careon:selectedTypes', JSON.stringify(next))
      return next
    })
  }

  const handleSaveProgram = (programId) => {
    const isAlreadySaved = savedProgramIds.includes(programId)

    setSavedProgramIds((current) => {
      if (current.includes(programId)) {
        return current.filter((id) => id !== programId)
      }
      return [...current, programId]
    })

    if (!isAlreadySaved && !installPromptInstalled && installPromptSkipCount < 2) {
      setShowInstallModal(true)
    }
  }

  const handleInstallConfirmed = () => {
    setInstallPromptInstalled(true)
    setShowInstallModal(false)
  }

  const handleInstallDeferred = () => {
    setInstallPromptSkipCount((count) => Math.min(count + 1, 2))
    setShowInstallModal(false)
  }

  const handleAuthSubmit = (formUser = DEFAULT_USER) => {
    setUser({
      name: formUser.name || DEFAULT_USER.name,
      email: formUser.email || DEFAULT_USER.email,
      district: formUser.district || DEFAULT_USER.district,
    })
    sessionStorage.setItem('careon:selectedTypes', JSON.stringify(selectedTypes))
    navigate(shouldShowFollowupFirst() ? 'followup' : authNextView)
    setAuthNextView('programs')
  }

  const handleStartFollowupAnalyzing = () => {
    localStorage.setItem(FOLLOWUP_COMPLETED_KEY, 'true')
    localStorage.removeItem(FOLLOWUP_PENDING_KEY)
    setAnalyzingNextView('programs')
    setAnalyzingComplete(false)
    navigate('analyzing')
  }

  const handleRestart = () => {
    setAnswers({})
    setSelectedTypes([])
    sessionStorage.removeItem('careon:selectedTypes')
    localStorage.removeItem(FOLLOWUP_PENDING_KEY)
    localStorage.removeItem(FOLLOWUP_COMPLETED_KEY)
    navigate('diagnosis')
  }

  const handleLogout = () => {
    setUser(null)
    navigate('onboarding')
  }

  const renderView = () => {
    if (view === 'diagnosis') {
      return (
        <DiagnosisPage
          answers={answers}
          selectedTypes={selectedTypes}
          onAnswer={handleAnswer}
          onToggleType={handleToggleType}
          onComplete={() => {
            setAnalyzingNextView('result')
            setAnalyzingComplete(false)
            navigate('analyzing')
          }}
          onBack={() => navigate('onboarding')}
        />
      )
    }

    if (view === 'analyzing') {
      return <AnalyzingPage complete={analyzingComplete} />
    }

    if (view === 'result') {
      return (
        <ResultPage
          eligible={eligible}
          answers={answers}
          selectedTypes={selectedTypes}
          alternativePrograms={selectedPrograms}
          savedProgramIds={savedProgramIds}
          onAuth={() => {
            localStorage.setItem(FOLLOWUP_PENDING_KEY, 'true')
            localStorage.removeItem(FOLLOWUP_COMPLETED_KEY)
            setAuthNextView('followup')
            navigate('auth')
          }}
          onSignup={() => {
            localStorage.setItem(FOLLOWUP_PENDING_KEY, 'true')
            localStorage.removeItem(FOLLOWUP_COMPLETED_KEY)
            setAuthNextView('followup')
            navigate('signup')
          }}
          onOpenProgram={(programId) => {
            setActiveProgramId(programId)
            navigate('detail')
          }}
          onSaveProgram={handleSaveProgram}
          onRestart={handleRestart}
        />
      )
    }

    if (view === 'followup') {
      return (
        <FollowupQuestionPage
          userName={user?.name}
          onComplete={handleStartFollowupAnalyzing}
        />
      )
    }

    if (view === 'auth') {
      return (
        <AuthPage
          onSubmit={handleAuthSubmit}
          onSkip={() => navigate('onboarding')}
          onFindPassword={() => navigate('passwordReset')}
        />
      )
    }

    if (view === 'signup') {
      return (
        <SignupPage
          onSubmit={handleAuthSubmit}
          onLogin={() => navigate('auth')}
        />
      )
    }

    if (view === 'passwordReset') {
      return (
        <PasswordResetPage
          onBack={() => navigate('auth')}
          onComplete={() => navigate('auth')}
        />
      )
    }

    if (view === 'programs') {
      return (
        <ProgramListPage
          programs={MOCK_PROGRAMS}
          selectedTypes={selectedTypes}
          savedProgramIds={savedProgramIds}
          user={user}
          showSideChat={showSideChat}
          onOpenChat={() => navigate('programChat')}
          onOpenProgram={(programId) => {
            setActiveProgramId(programId)
            navigate('detail')
          }}
          onSaveProgram={handleSaveProgram}
        />
      )
    }

    if (view === 'programChat') {
      return (
        <ProgramChatPage
          user={user}
          selectedTypes={selectedTypes}
          onBack={() => navigate('programs')}
        />
      )
    }

    if (view === 'detail') {
      return (
        <ProgramDetailPage
          program={activeProgram}
          saved={savedProgramIds.includes(activeProgramId)}
          user={user}
          selectedTypes={selectedTypes}
          onBack={() => navigate('programs')}
          onSaveProgram={handleSaveProgram}
        />
      )
    }

    if (view === 'mypage') {
      return (
        <MyPage
          user={user}
          savedPrograms={savedPrograms}
          onUpdateUser={setUser}
          onLogout={handleLogout}
          onDeleteAccount={() => {
            setUser(null)
            setSavedProgramIds([])
            navigate('onboarding')
          }}
          onLogin={() => navigate('auth')}
        />
      )
    }

    return (
      <OnboardingPage
        onStart={() => navigate('diagnosis')}
        onLogin={() => {
          setAuthNextView('programs')
          navigate('auth')
        }}
      />
    )
  }

  return (
    <PageShell
      currentView={view}
      user={user}
      showSideChat={showSideChat}
      onToggleSideChat={() => setShowSideChat((current) => !current)}
      onNavigate={navigate}
      onLogout={handleLogout}
    >
      {renderView()}
      <Modal
        open={showInstallModal}
        title="마감일 알림은 CareOn 앱에서 받을 수 있어요"
        primaryLabel="설치했어요"
        secondaryLabel="나중에 할게요"
        className="install-modal"
        onPrimary={handleInstallConfirmed}
        onSecondary={handleInstallDeferred}
      >
        <p>
          지금 설치하면 신청 마감일이 다가올 때<br />
          놓치지 않도록 알려드려요
        </p>
      </Modal>
    </PageShell>
  )
}

export default App
