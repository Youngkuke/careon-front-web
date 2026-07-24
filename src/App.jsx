import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { REQUIRED_DIAGNOSIS_IDS } from './constants/diagnosisQuestions'
import {
  api,
  clearAccessToken,
  getAccessToken,
  normalizeMatchedPolicyGroups,
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

const needsFollowupDiagnosis = (loginResponse, me) => (
  loginResponse?.diagnosisCompleted === false
  || me?.diagnosisCompleted === false
  || shouldShowFollowupFirst()
)

const toApiPolicyId = (programId) => {
  const policyId = Number(programId)
  return Number.isSafeInteger(policyId) ? policyId : null
}

const isPasswordResetUrl = () => (
  window.location.pathname === '/reset-password'
  || new URLSearchParams(window.location.search).has('token')
  || new URLSearchParams(window.location.search).has('resetToken')
)

const clearPasswordResetUrl = () => {
  if (isPasswordResetUrl()) {
    window.history.replaceState(null, '', '/')
  }
}

function App() {
  const [view, setView] = useState(() => (isPasswordResetUrl() ? 'passwordReset' : 'onboarding'))
  const historyInitializedRef = useRef(false)
  const [answers, setAnswers] = useState({})
  const [selectedTypes, setSelectedTypes] = useState(readSessionTypes)
  const [user, setUser] = useState(null)
  const [programs, setPrograms] = useState([])
  const [savedProgramIds, setSavedProgramIds] = useState([])
  const [savedPolicyIdByProgramId, setSavedPolicyIdByProgramId] = useState({})
  const [activeProgramId, setActiveProgramId] = useState(null)
  const [installPromptSkipCount, setInstallPromptSkipCount] = useState(0)
  const [installPromptInstalled, setInstallPromptInstalled] = useState(false)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [showRevisitModal, setShowRevisitModal] = useState(false)
  const [showSideChat, setShowSideChat] = useState(true)
  const [authNextView, setAuthNextView] = useState('programs')
  const [analyzingNextView, setAnalyzingNextView] = useState('result')
  const [analyzingComplete, setAnalyzingComplete] = useState(false)
  const [apiError, setApiError] = useState('')
  const [apiLoading, setApiLoading] = useState(false)
  const [alternativePrograms, setAlternativePrograms] = useState([])
  const [alternativesLoading, setAlternativesLoading] = useState(false)
  const [alternativesError, setAlternativesError] = useState('')

  useEffect(() => {
    if (!historyInitializedRef.current) {
      const initialView = isPasswordResetUrl() ? 'passwordReset' : 'onboarding'
      window.history.replaceState({ careonView: initialView, careonRoot: true }, '', window.location.href)
      window.history.pushState({ careonView: initialView }, '', window.location.href)
      historyInitializedRef.current = true
    }

    const handlePopState = (event) => {
      const nextView = event.state?.careonView
      if (!nextView) return

      setView(nextView)

      if (event.state.careonRoot) {
        window.history.pushState({ careonView: nextView }, '', window.location.href)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const eligible = REQUIRED_DIAGNOSIS_IDS.every((id) => answers[id] === true)
  const activeProgram = programs.find((program) => program.id === activeProgramId)
  const clearUserSession = useCallback(() => {
    clearAccessToken()
    setUser(null)
    setSavedProgramIds([])
    setSavedPolicyIdByProgramId({})
    setPrograms([])
  }, [])

  const handleAuthExpired = useCallback(() => {
    clearUserSession()
    setApiError('로그인이 필요합니다. 다시 로그인해주세요.')
    setView('auth')
  }, [clearUserSession])

  const refreshSavedPolicies = useCallback(async () => {
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
  }, [])

  const refreshMatchedPolicies = useCallback(async () => {
    const groups = await api.getMatchedPolicies()
    const nextPrograms = normalizeMatchedPolicyGroups(groups)
    setPrograms(nextPrograms.length ? nextPrograms : [])
    return nextPrograms
  }, [])

  const refreshProgramData = useCallback(async () => {
    await refreshMatchedPolicies()
    await refreshSavedPolicies()
  }, [refreshMatchedPolicies, refreshSavedPolicies])

  useEffect(() => {
    let ignore = false

    if (!user || user.diagnosisCompleted !== true) {
      return () => {
        ignore = true
      }
    }

    const loadPrograms = api.getMatchedPolicies()
      .then((groups) => normalizeMatchedPolicyGroups(groups))

    loadPrograms
      .then((nextPrograms) => {
        if (!ignore) {
          setPrograms(nextPrograms.length ? nextPrograms : [])
        }
      })
      .catch((error) => {
        if (!ignore) {
          if (error.status === 401) {
            handleAuthExpired()
          } else {
            setPrograms([])
            setApiError(error.message)
          }
        }
      })

    return () => {
      ignore = true
    }
  }, [handleAuthExpired, user])

  const loadAlternativePrograms = useCallback(async () => {
    setAlternativesLoading(true)
    setAlternativesError('')

    try {
      const alternatives = await api.getAlternatives(selectedTypeIdsToApiIds(selectedTypes))
      setAlternativePrograms(alternatives.map(normalizePolicy))
    } catch (error) {
      setAlternativePrograms([])
      setAlternativesError(error.message)
    } finally {
      setAlternativesLoading(false)
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
        if (!isPasswordResetUrl()) {
          setView(me.diagnosisCompleted === false ? 'followup' : 'programs')
        }
      } catch {
        clearAccessToken()
      }
    }

    restoreSession()
  }, [refreshSavedPolicies])

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
    const commitNavigation = (targetView) => {
      window.history.pushState({ careonView: targetView }, '', window.location.href)
      setView(targetView)
    }

    if (view === 'passwordReset' && nextView !== 'passwordReset') {
      clearPasswordResetUrl()
    }

    if (nextView === 'programs' && !user) {
      commitNavigation('auth')
      return
    }

    if (nextView === 'programs' && shouldShowFollowupFirst()) {
      commitNavigation('followup')
      return
    }

    if (nextView === 'programs') {
      setActiveProgramId(null)
    }
    commitNavigation(nextView)
  }

  const navigateWithClearedError = (nextView) => {
    setApiError('')
    navigate(nextView)
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

    const policyId = toApiPolicyId(programId)
    if (policyId === null) {
      setApiError('현재 표시된 제도는 저장할 수 없어요. 맞춤 제도를 다시 불러온 뒤 저장해 주세요.')
      return
    }

    const isAlreadySaved = savedProgramIds.includes(programId)
    setApiError('')

    try {
      if (isAlreadySaved) {
        await api.cancelSavedPolicy(savedPolicyIdByProgramId[programId])
      } else {
        await api.savePolicy(policyId)
      }

      await refreshSavedPolicies()

      if (!isAlreadySaved && !installPromptInstalled && installPromptSkipCount < 2) {
        setShowInstallModal(true)
      }
    } catch (error) {
      if (error.status === 401) {
        handleAuthExpired()
      } else {
        setApiError(error.message)
      }
    }
  }

  const handleInstallConfirmed = async () => {
    if (user) {
      try {
        await api.updateAppInstallStatus(true)
      } catch (error) {
        if (error.status === 401) {
          handleAuthExpired()
        } else {
          setApiError(error.message)
        }
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
        if (error.status === 401) {
          handleAuthExpired()
        } else {
          setApiError(error.message)
        }
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
      const nextView = needsFollowupDiagnosis(response, me) ? 'followup' : authNextView
      if (nextView === 'programs') {
        setShowRevisitModal(true)
      }
      if (nextView === 'programs') {
        setActiveProgramId(null)
        setView('programs')
      } else {
        navigate(nextView)
      }
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
      navigate(needsFollowupDiagnosis(response, me) ? 'followup' : authNextView)
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
        program.id === programId ? {
          ...program,
          ...detail,
          matchedPolicyId: detail.matchedPolicyId ?? program.matchedPolicyId,
          matchGroup: detail.matchGroup ?? program.matchGroup,
          wasBenefited: detail.wasBenefited ?? program.wasBenefited,
          savedPolicyId: detail.savedPolicyId ?? program.savedPolicyId,
        } : program
      )))
    } catch (error) {
      setApiError(error.message)
    }
  }

  const handleStartFollowupAnalyzing = async () => {
    try {
      const me = await api.me()
      setUser(me)
      setInstallPromptInstalled(me.appInstalled)
      setInstallPromptSkipCount(me.installPromptCount || 0)
    } catch (error) {
      if (error.status === 401) {
        handleAuthExpired()
        return
      }
    }

    localStorage.setItem(FOLLOWUP_COMPLETED_KEY, 'true')
    localStorage.removeItem(FOLLOWUP_PENDING_KEY)
    setAnalyzingNextView('programs')
    setAnalyzingComplete(false)
    navigate('analyzing')
  }

  const handleRevisitNoChange = () => {
    setShowRevisitModal(false)
  }

  const handleRevisitChanged = () => {
    localStorage.setItem(FOLLOWUP_PENDING_KEY, 'true')
    localStorage.removeItem(FOLLOWUP_COMPLETED_KEY)
    setShowRevisitModal(false)
    navigate('followup')
  }

  const handleRevisitSkipToday = () => {
    setShowRevisitModal(false)
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
    clearUserSession()
    navigate('onboarding')
  }

  const handleUpdateUser = async (form) => {
    setApiError('')
    try {
      const verification = await api.login({
        email: form.email,
        password: form.currentPassword,
      })
      setAccessToken(verification.accessToken)
    } catch {
      setApiError('현재 비밀번호가 일치하지 않아요.')
      return false
    }

    try {
      await api.updateMe({
        name: form.name,
        password: form.newPassword || undefined,
        region: form.district,
      })
      setUser(await api.me())
      return true
    } catch (error) {
      if (error.status === 401) {
        handleAuthExpired()
      } else {
        setApiError(error.message)
      }
      return false
    }
  }

  const handleDeleteAccount = async () => {
    setApiError('')
    try {
      await api.withdraw()
      clearUserSession()
      navigate('onboarding')
    } catch (error) {
      if (error.status === 401) {
        handleAuthExpired()
      } else {
        setApiError(error.message)
      }
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
          alternativePrograms={alternativePrograms}
          alternativesLoading={alternativesLoading}
          alternativesError={alternativesError}
          savedProgramIds={savedProgramIds}
          onLoadAlternatives={loadAlternativePrograms}
          onAuth={() => {
            localStorage.setItem(FOLLOWUP_PENDING_KEY, 'true')
            localStorage.removeItem(FOLLOWUP_COMPLETED_KEY)
            setAuthNextView('followup')
            navigateWithClearedError('auth')
          }}
          onSignup={() => {
            localStorage.setItem(FOLLOWUP_PENDING_KEY, 'true')
            localStorage.removeItem(FOLLOWUP_COMPLETED_KEY)
            setAuthNextView('followup')
            navigateWithClearedError('signup')
          }}
          onOpenProgram={handleOpenProgram}
          onRestart={handleRestart}
        />
      )
    }

    if (view === 'followup') {
      return (
        <FollowupQuestionPage
          user={user}
          onAuthExpired={handleAuthExpired}
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
          onSkip={() => navigateWithClearedError('onboarding')}
          onFindPassword={() => navigateWithClearedError('passwordReset')}
        />
      )
    }

    if (view === 'signup') {
      return (
        <SignupPage
          error={apiError}
          loading={apiLoading}
          onSubmit={handleSignup}
          onLogin={() => navigateWithClearedError('auth')}
        />
      )
    }

    if (view === 'passwordReset') {
      return (
        <PasswordResetPage
          onSendResetLink={api.sendPasswordResetLink}
          onResetPassword={api.resetPassword}
          onBack={() => {
            clearPasswordResetUrl()
            navigateWithClearedError('auth')
          }}
          onComplete={() => {
            clearPasswordResetUrl()
            navigateWithClearedError('auth')
          }}
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
          error={apiError}
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
          onAuthExpired={handleAuthExpired}
          onMatchedPoliciesRefresh={refreshProgramData}
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
          error={apiError}
          onUpdateUser={handleUpdateUser}
          onDeleteAccount={handleDeleteAccount}
          onLogin={() => navigateWithClearedError('auth')}
          onBack={() => navigate('programs')}
        />
      )
    }

    return (
      <OnboardingPage
        onStart={() => navigate('diagnosis')}
        onLogin={() => {
          setAuthNextView('programs')
          navigateWithClearedError('auth')
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
      <Modal
        open={showRevisitModal}
        title="혹시 돌봄 상황이 바뀌었나요?"
        primaryLabel="변동 없어요"
        secondaryLabel="상황이 바뀌었어요"
        tertiaryLabel="오늘 하루 안보기"
        className="revisit-modal"
        onPrimary={handleRevisitNoChange}
        onSecondary={handleRevisitChanged}
        onTertiary={handleRevisitSkipToday}
      >
        <p>
          바뀐 가족 구성, 돌봄 강도, 소득이나 거주지가 있다면<br />
          다시 여쭤보고 맞춤 제도를 새로 살펴볼게요.
        </p>
      </Modal>
    </PageShell>
  )
}

export default App
