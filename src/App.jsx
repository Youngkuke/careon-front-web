import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { REQUIRED_DIAGNOSIS_IDS } from './constants/diagnosisQuestions'
import { MOCK_PROGRAMS } from './data/mockPrograms'
import { DEFAULT_USER } from './data/mockUser'
import { Modal } from './components/common/Modal'
import { PageShell } from './components/layout/PageShell'
import { AuthPage } from './pages/AuthPage'
import { DiagnosisPage } from './pages/DiagnosisPage'
import { MyPage } from './pages/MyPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { PasswordResetPage } from './pages/PasswordResetPage'
import { ProgramDetailPage } from './pages/ProgramDetailPage'
import { ProgramListPage } from './pages/ProgramListPage'
import { ResultPage } from './pages/ResultPage'
import { SignupPage } from './pages/SignupPage'

function AnalyzingPage() {
  return (
    <section className="flow-page">
      <div className="flow-card analyzing-card">
        <div className="loading-orb" aria-hidden="true" />
        <h1 className="analyzing-message">
          작성해주신 소중한 답변을 바탕으로,<br />
          지금 가장 필요한 도움을 분석하고 있어요
        </h1>
        <div className="loading-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
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

function App() {
  const [view, setView] = useState('onboarding')
  const [answers, setAnswers] = useState({})
  const [selectedTypes, setSelectedTypes] = useState(readSessionTypes)
  const [user, setUser] = useState(null)
  const [savedProgramIds, setSavedProgramIds] = useState([])
  const [activeProgramId, setActiveProgramId] = useState(null)
  const [installPromptCount, setInstallPromptCount] = useState(0)
  const [showInstallModal, setShowInstallModal] = useState(false)

  const eligible = REQUIRED_DIAGNOSIS_IDS.every((id) => answers[id] === true)
  const activeProgram = MOCK_PROGRAMS.find((program) => program.id === activeProgramId)
  const selectedPrograms = useMemo(() => {
    const types = selectedTypes.length ? selectedTypes : ['living', 'care', 'medical', 'mental']
    return MOCK_PROGRAMS.filter((program) => types.includes(program.type))
  }, [selectedTypes])
  const savedPrograms = MOCK_PROGRAMS.filter((program) => savedProgramIds.includes(program.id))

  useEffect(() => {
    if (view !== 'analyzing') return undefined

    const timer = window.setTimeout(() => {
      setView('result')
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [view])

  const navigate = (nextView) => {
    if (nextView === 'programs' && !user) {
      setView('auth')
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
    setSavedProgramIds((current) => {
      if (current.includes(programId)) {
        return current.filter((id) => id !== programId)
      }
      return [...current, programId]
    })

    if (installPromptCount < 2) {
      setInstallPromptCount((count) => count + 1)
      setShowInstallModal(true)
    }
  }

  const handleAuthSubmit = (formUser = DEFAULT_USER) => {
    setUser({
      name: formUser.name || DEFAULT_USER.name,
      email: formUser.email || DEFAULT_USER.email,
      district: formUser.district || DEFAULT_USER.district,
    })
    sessionStorage.setItem('careon:selectedTypes', JSON.stringify(selectedTypes))
    navigate('programs')
  }

  const handleRestart = () => {
    setAnswers({})
    setSelectedTypes([])
    sessionStorage.removeItem('careon:selectedTypes')
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
          onComplete={() => navigate('analyzing')}
          onBack={() => navigate('onboarding')}
        />
      )
    }

    if (view === 'analyzing') {
      return <AnalyzingPage />
    }

    if (view === 'result') {
      return (
        <ResultPage
          eligible={eligible}
          answers={answers}
          selectedTypes={selectedTypes}
          alternativePrograms={selectedPrograms}
          savedProgramIds={savedProgramIds}
          onAuth={() => navigate('auth')}
          onSignup={() => navigate('signup')}
          onOpenProgram={(programId) => {
            setActiveProgramId(programId)
            navigate('detail')
          }}
          onSaveProgram={handleSaveProgram}
          onRestart={handleRestart}
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
          onOpenProgram={(programId) => {
            setActiveProgramId(programId)
            navigate('detail')
          }}
          onSaveProgram={handleSaveProgram}
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

    return <OnboardingPage onStart={() => navigate('diagnosis')} onLogin={() => navigate('auth')} />
  }

  return (
    <PageShell currentView={view} user={user} onNavigate={navigate} onLogout={handleLogout}>
      {renderView()}
      <Modal
        open={showInstallModal}
        title="앱에서 마감일 알림을 받을 수 있어요"
        primaryLabel="설치했어요"
        secondaryLabel="나중에 할게요"
        onPrimary={() => setShowInstallModal(false)}
        onSecondary={() => setShowInstallModal(false)}
      >
        <p>
          웹에서는 제도 확인까지 빠르게 돕고, 앱에서는 저장한 제도의 마감일과 서류 준비 알림을 이어서 받을 수 있습니다.
        </p>
      </Modal>
    </PageShell>
  )
}

export default App
