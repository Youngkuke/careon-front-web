import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { REQUIRED_DIAGNOSIS_IDS } from './constants/diagnosisQuestions'
import { MOCK_PROGRAMS } from './data/mockPrograms'
import {
  api,
  clearAccessToken,
  getAccessToken,
  normalizePolicy,
  selectedTypeIdsToApiIds,
  setAccessToken,
} from './lib/api'
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
  const [programs, setPrograms] = useState(MOCK_PROGRAMS)
  const [savedProgramIds, setSavedProgramIds] = useState([])
  const [savedPolicyIdByProgramId, setSavedPolicyIdByProgramId] = useState({})
  const [activeProgramId, setActiveProgramId] = useState(null)
  const [installPromptSkipCount, setInstallPromptSkipCount] = useState(0)
  const [installPromptInstalled, setInstallPromptInstalled] = useState(false)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [showSideChat, setShowSideChat] = useState(true)
  const [authNextView, setAuthNextView] = useState('programs')
  const [analyzingNextView, setAnalyzingNextView] = useState('result')
  const [analyzingComplete, setAnalyzingComplete] = useState(false)
  const [apiError, setApiError] = useState('')
  const [apiLoading, setApiLoading] = useState(false)

  const eligible = REQUIRED_DIAGNOSIS_IDS.every((id) => answers[id] === true)
  const activeProgram = programs.find((program) => program.id === activeProgramId)
  const selectedPrograms = useMemo(() => {
    const types = selectedTypes.length ? selectedTypes : ['living', 'care', 'medical', 'mental']
    return programs.filter((program) => types.includes(program.type))
  }, [programs, selectedTypes])
  const savedPrograms = programs.filter((program) => savedProgramIds.includes(program.id))

  const refreshSavedPolicies = async () => {
    const savedPolicies = await api.getSavedPolicies()
    const normalized = savedPolicies.map(normalizePolicy)

    setSavedProgramIds(normalized.map((program) => program.id))
    setSavedPolicyIdByProgramId(Object.fromEntries(
      normalized.map((program) => [program.id, program.savedPolicyId]),
    ))
    setPrograms((current) => {
      const existingIds = new Set(current.map((program) => program.id))
      return [...current, ...normalized.filter((program) => !existingIds.has(program.id))]
    })
  }

  useEffect(() => {
    let ignore = false

    api.getAlternatives(selectedTypeIdsToApiIds(selectedTypes))
      .then((alternatives) => {
        if (!ignore) {
          setPrograms(alternatives.map(normalizePolicy))
        }
      })
      .catch(() => {
        if (!ignore) {
          setPrograms(MOCK_PROGRAMS)
        }
      })

    return () => {
      ignore = true
    }
  }, [selectedTypes])

  useEffect(() => {
    if (!getAccessToken()) return

    const restoreSession = async () => {
      try {
        const me = await api.me()
        setUser(me)
        setInstallPromptInstalled(me.appInstalled)
        setInstallPromptSkipCount(me.installPromptCount || 0)
        await refreshSavedPolicies()
      } catch {
        clearAccessToken()
      }
    }

    restoreSession()
  }, [])

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

  const handleSaveProgram = async (programId) => {
    if (!user) return

    const isAlreadySaved = savedProgramIds.includes(programId)
    setApiError('')

    try {
      if (isAlreadySaved) {
        await api.cancelSavedPolicy(savedPolicyIdByProgramId[programId])
      } else {
        await api.savePolicy(programId)
      }

      await refreshSavedPolicies()

      if (!isAlreadySaved && !installPromptInstalled && installPromptSkipCount < 2) {
        setShowInstallModal(true)
      }
    } catch (error) {
      setApiError(error.message)
    }
  }

  const handleInstallConfirmed = async () => {
    if (user) {
      try {
        await api.updateAppInstallStatus(true)
      } catch (error) {
        setApiError(error.message)
      }
    }
    setInstallPromptInstalled(true)
    setShowInstallModal(false)
  }

  const handleInstallDeferred = async () => {
    if (user) {
      try {
        await api.updateAppInstallStatus(false)
      } catch (error) {
        setApiError(error.message)
      }
    }
    setInstallPromptSkipCount((count) => Math.min(count + 1, 2))
    setShowInstallModal(false)
  }

  const handleLogin = async (form) => {
    setApiLoading(true)
    setApiError('')

    try {
      const response = await api.login(form)
      setAccessToken(response.accessToken)
      const me = await api.me()
      setUser(me)
      setInstallPromptInstalled(me.appInstalled)
      setInstallPromptSkipCount(me.installPromptCount || 0)
      await refreshSavedPolicies()
      sessionStorage.setItem('careon:selectedTypes', JSON.stringify(selectedTypes))
      navigate(shouldShowFollowupFirst() ? 'followup' : authNextView)
      setAuthNextView('programs')
    } catch (error) {
      setApiError(error.message)
    } finally {
      setApiLoading(false)
    }
  }

  const handleSignup = async (form) => {
    setApiLoading(true)
    setApiError('')

    try {
      const response = await api.signup({
        name: form.name,
        email: form.email,
        password: form.password,
        region: form.district,
        termsAgreed: form.agreed,
        interestPolicyTypeIds: selectedTypeIdsToApiIds(selectedTypes),
      })
      setAccessToken(response.accessToken)
      const me = await api.me()
      setUser(me)
      navigate(shouldShowFollowupFirst() ? 'followup' : authNextView)
      setAuthNextView('programs')
    } catch (error) {
      setApiError(error.message)
    } finally {
      setApiLoading(false)
    }
  }

  const handleOpenProgram = async (programId) => {
    setActiveProgramId(programId)
    navigate('detail')

    if (typeof programId !== 'number') return

    try {
      const detail = normalizePolicy(await api.getPolicyDetail(programId))
      setPrograms((current) => current.map((program) => (
        program.id === programId ? { ...program, ...detail } : program
      )))
    } catch (error) {
      setApiError(error.message)
    }
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
    clearAccessToken()
    setUser(null)
    setSavedProgramIds([])
    setSavedPolicyIdByProgramId({})
    navigate('onboarding')
  }

  const handleUpdateUser = async (form) => {
    setApiError('')
    try {
      await api.updateMe({
        name: form.name,
        email: form.email,
        password: form.password || undefined,
        region: form.district,
      })
      setUser(await api.me())
    } catch (error) {
      setApiError(error.message)
    }
  }

  const handleDeleteAccount = async () => {
    setApiError('')
    try {
      await api.withdraw()
      clearAccessToken()
      setUser(null)
      setSavedProgramIds([])
      setSavedPolicyIdByProgramId({})
      navigate('onboarding')
    } catch (error) {
      setApiError(error.message)
    }
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
          onOpenProgram={handleOpenProgram}
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
          error={apiError}
          loading={apiLoading}
          onSubmit={handleLogin}
          onSkip={() => navigate('onboarding')}
          onFindPassword={() => navigate('passwordReset')}
        />
      )
    }

    if (view === 'signup') {
      return (
        <SignupPage
          error={apiError}
          loading={apiLoading}
          onSubmit={handleSignup}
          onLogin={() => navigate('auth')}
        />
      )
    }

    if (view === 'passwordReset') {
      return (
        <PasswordResetPage
          onSendResetLink={api.sendPasswordResetLink}
          onBack={() => navigate('auth')}
          onComplete={() => navigate('auth')}
        />
      )
    }

    if (view === 'programs') {
      return (
        <ProgramListPage
          programs={programs}
          selectedTypes={selectedTypes}
          savedProgramIds={savedProgramIds}
          user={user}
          showSideChat={showSideChat}
          onOpenChat={() => navigate('programChat')}
          onOpenProgram={handleOpenProgram}
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
          error={apiError}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
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
