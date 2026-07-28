import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { REQUIRED_DIAGNOSIS_IDS } from './constants/diagnosisQuestions'
import {
  api,
  clearAccessToken,
  getAccessToken,
  normalizePolicy,
  setAccessToken,
} from './lib/api'
import { Modal } from './components/common/Modal'
import { PageShell } from './components/layout/PageShell'
import endLoadingImg from './assets/endloading.webp'
import startLoadingImg from './assets/startloading.webp'

const FOLLOWUP_PENDING_KEY = 'careon:followupPending'
const FOLLOWUP_COMPLETED_KEY = 'careon:followupCompleted'

const AuthPage = lazy(() => import('./pages/AuthPage').then(({ AuthPage: Page }) => ({ default: Page })))
const DiagnosisPage = lazy(() => import('./pages/DiagnosisPage').then(({ DiagnosisPage: Page }) => ({ default: Page })))
const FollowupQuestionPage = lazy(() => import('./pages/FollowupQuestionPage').then(({ FollowupQuestionPage: Page }) => ({ default: Page })))
const MyPage = lazy(() => import('./pages/MyPage').then(({ MyPage: Page }) => ({ default: Page })))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(({ OnboardingPage: Page }) => ({ default: Page })))
const PasswordResetPage = lazy(() => import('./pages/PasswordResetPage').then(({ PasswordResetPage: Page }) => ({ default: Page })))
const ProgramChatPage = lazy(() => import('./pages/ProgramChatPage').then(({ ProgramChatPage: Page }) => ({ default: Page })))
const ProgramDetailPage = lazy(() => import('./pages/ProgramDetailPage').then(({ ProgramDetailPage: Page }) => ({ default: Page })))
const ProgramListPage = lazy(() => import('./pages/ProgramListPage').then(({ ProgramListPage: Page }) => ({ default: Page })))
const ResultPage = lazy(() => import('./pages/ResultPage').then(({ ResultPage: Page }) => ({ default: Page })))
const SignupPage = lazy(() => import('./pages/SignupPage').then(({ SignupPage: Page }) => ({ default: Page })))

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

function SessionRestorePage() {
  return (
    <section className="flow-page">
      <div className="flow-card analyzing-card">
        <div className="loading-spinner" aria-hidden="true">
          <svg className="loading-spinner__ring" viewBox="0 0 120 120">
            <circle className="loading-spinner__track" cx="60" cy="60" r="51" />
            <circle className="loading-spinner__progress" cx="60" cy="60" r="51" />
          </svg>
          <img className="loading-spinner__icon" src={startLoadingImg} alt="" />
        </div>
        <h1 className="analyzing-message">맞춤 제도를 불러오고 있어요</h1>
      </div>
    </section>
  )
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

const toApiPolicyReference = (programId) => {
  return typeof programId === 'string' && programId ? programId : null
}

const flattenCbResults = (results) => {
  if (!results) return []

  const seenIds = new Set()

  return [
    { section: results.banner, recommendationSection: 'matched' },
    { section: results.matched, recommendationSection: 'matched' },
    { section: results.maybe, recommendationSection: 'maybe' },
  ]
    .flatMap(({ section, recommendationSection }) => (
      (section?.institutions || []).map((program) => ({
        ...program,
        recommendationSection,
      }))
    ))
    .filter((program) => {
      if (!program.id || seenIds.has(program.id)) return false
      seenIds.add(program.id)
      return true
    })
}

const mergePrograms = (...lists) => {
  const programsById = new Map()

  lists.flat().forEach((program) => {
    if (!program?.id) return

    const previous = programsById.get(program.id)
    programsById.set(program.id, previous ? {
      ...previous,
      ...program,
      source: previous.source || program.source,
      savedPolicyId: program.savedPolicyId ?? previous.savedPolicyId,
      matchedPolicyId: program.matchedPolicyId ?? previous.matchedPolicyId,
      matchGroup: program.matchGroup ?? previous.matchGroup,
      wasBenefited: program.wasBenefited ?? previous.wasBenefited,
    } : program)
  })

  return [...programsById.values()]
}

const withProgramDetail = (programs, programId, detail) => programs.map((program) => (
  program.id === programId ? {
    ...program,
    ...detail,
    deadline: detail.deadline === '공식 안내 확인' ? program.deadline : detail.deadline,
    resultTime: detail.resultTime === '공식 안내 확인' ? program.resultTime : detail.resultTime,
    source: program.source || detail.source,
    matchedPolicyId: detail.matchedPolicyId ?? program.matchedPolicyId,
    matchGroup: detail.matchGroup ?? program.matchGroup,
    wasBenefited: detail.wasBenefited ?? program.wasBenefited,
    savedPolicyId: detail.savedPolicyId ?? program.savedPolicyId,
  } : program
))

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
  const [view, setView] = useState(() => {
    if (isPasswordResetUrl()) return 'passwordReset'
    return getAccessToken() ? 'restoringSession' : 'onboarding'
  })
  const historyInitializedRef = useRef(false)
  const detailCacheRef = useRef(new Map())
  const openingProgramRef = useRef(false)
  const [answers, setAnswers] = useState({})
  const [user, setUser] = useState(null)
  const [recommendedPrograms, setRecommendedPrograms] = useState([])
  const [savedPrograms, setSavedPrograms] = useState([])
  const [savedProgramIds, setSavedProgramIds] = useState([])
  const [savedPolicyIdByProgramId, setSavedPolicyIdByProgramId] = useState({})
  const [activeProgramId, setActiveProgramId] = useState(null)
  const [activeAlternativeProgram, setActiveAlternativeProgram] = useState(null)
  const [showProgramDetail, setShowProgramDetail] = useState(false)
  const [openingProgramId, setOpeningProgramId] = useState(null)
  const [cbResults, setCbResults] = useState(null)
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [installPromptSkipCount, setInstallPromptSkipCount] = useState(0)
  const [installPromptInstalled, setInstallPromptInstalled] = useState(false)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [showRevisitModal, setShowRevisitModal] = useState(false)
  const [showSignupExitModal, setShowSignupExitModal] = useState(false)
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
  const programs = useMemo(
    () => mergePrograms(recommendedPrograms, savedPrograms),
    [recommendedPrograms, savedPrograms],
  )
  const activeProgram = programs.find((program) => program.id === activeProgramId) || activeAlternativeProgram
  const clearUserSession = useCallback(() => {
    clearAccessToken()
    setUser(null)
    setSavedProgramIds([])
    setSavedPolicyIdByProgramId({})
    setRecommendedPrograms([])
    setSavedPrograms([])
    setActiveAlternativeProgram(null)
    setShowProgramDetail(false)
    setCbResults(null)
    setRecommendationsLoading(false)
    setAlternativePrograms([])
    setAlternativesError('')
    detailCacheRef.current.clear()
  }, [])

  const handleAuthExpired = useCallback(() => {
    clearUserSession()
    setApiError('로그인이 필요합니다. 다시 로그인해주세요.')
    setView('auth')
  }, [clearUserSession])

  const restoreLatestCbResults = useCallback(async () => {
    const latestThread = await api.getLatestCbThread()

    if (!latestThread.threadId || latestThread.phase !== 'ready') {
      return null
    }

    const results = await api.getCbResults(latestThread.threadId)

    setCbResults(results)
    setRecommendedPrograms(flattenCbResults(results))
    return results
  }, [])

  const refreshSavedPolicies = useCallback(async () => {
    const savedPolicies = await api.getSavedPolicies()
    const normalized = savedPolicies
      .map(normalizePolicy)
      .filter((program) => typeof program.servId === 'string' && program.servId)

    setSavedProgramIds(normalized.map((program) => program.id))
    setSavedPolicyIdByProgramId(Object.fromEntries(
      normalized.map((program) => [program.id, program.savedPolicyId]),
    ))
    setSavedPrograms(normalized)
  }, [])

  const loadAlternativePrograms = useCallback(async () => {
    setAlternativesLoading(true)
    setAlternativesError('')

    try {
      const alternatives = await api.getAlternatives()
      setAlternativePrograms(alternatives.map(normalizePolicy))
    } catch (error) {
      setAlternativePrograms([])
      setAlternativesError(error.message)
    } finally {
      setAlternativesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!getAccessToken()) return

    const restoreSession = async () => {
      try {
        const me = await api.me()
        setUser(me)
        setInstallPromptInstalled(me.appInstalled)
        setInstallPromptSkipCount(me.installPromptCount || 0)
        const [latestCbResults] = await Promise.all([
          restoreLatestCbResults(),
          refreshSavedPolicies(),
        ])
        if (!isPasswordResetUrl()) {
          setView(latestCbResults ? 'programs' : (me.diagnosisCompleted === false ? 'followup' : 'programs'))
        }
      } catch {
        clearAccessToken()
        if (!isPasswordResetUrl()) setView('onboarding')
      }
    }

    restoreSession()
  }, [refreshSavedPolicies, restoreLatestCbResults])

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
      setActiveAlternativeProgram(null)
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

  const handleSaveProgram = async (programId) => {
    if (!user) return

    const policyReference = toApiPolicyReference(programId)
    if (policyReference === null) {
      setApiError('현재 표시된 제도는 저장할 수 없어요. 맞춤 제도를 다시 불러온 뒤 저장해 주세요.')
      return
    }

    const isAlreadySaved = savedProgramIds.includes(programId)
    setApiError('')

    try {
      if (isAlreadySaved) {
        await api.cancelSavedPolicy(savedPolicyIdByProgramId[programId])
      } else {
        await api.savePolicy(policyReference)
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
      const [latestCbResults] = await Promise.all([
        restoreLatestCbResults(),
        refreshSavedPolicies(),
      ])

      if (latestCbResults) {
        setActiveProgramId(null)
        setView('programs')
        setAuthNextView('programs')
        return
      }

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
      })
      setAccessToken(response.accessToken)
      const me = await api.me()
      setUser(me)
      const nextView = needsFollowupDiagnosis(response, me) ? 'followup' : authNextView
      navigate(nextView)
      setAuthNextView('programs')
    } catch (error) {
      setApiError(error.message)
    } finally {
      setApiLoading(false)
    }
  }

  const handleOpenProgram = async (programId) => {
    if (openingProgramRef.current) return

    const alternativeProgram = alternativePrograms.find((program) => program.id === programId)
    openingProgramRef.current = true
    setOpeningProgramId(programId)
    setApiError('')

    try {
      let detail = detailCacheRef.current.get(programId)

      if (!detail) {
        detail = typeof programId === 'string'
          ? await api.getCbInstitution(programId)
          : normalizePolicy(await api.getPolicyDetail(programId))
        detailCacheRef.current.set(programId, detail)
      }

      setRecommendedPrograms((current) => withProgramDetail(current, programId, detail))
      setSavedPrograms((current) => withProgramDetail(current, programId, detail))
      setActiveProgramId(programId)
      setActiveAlternativeProgram(alternativeProgram ? { ...alternativeProgram, ...detail } : null)
      setShowProgramDetail(true)
    } catch (error) {
      if (error.status === 401) {
        handleAuthExpired()
        return
      }
      setApiError(error.message)
    } finally {
      openingProgramRef.current = false
      setOpeningProgramId(null)
    }
  }

  const handleCbResultsReady = async (threadId, origin) => {
    localStorage.setItem(FOLLOWUP_COMPLETED_KEY, 'true')
    localStorage.removeItem(FOLLOWUP_PENDING_KEY)
    setRecommendationsLoading(true)
    setRecommendedPrograms([])

    if (origin === 'followup') {
      navigate('programs')
    }

    try {
      const results = await api.getCbResults(threadId)
      setCbResults(results)
      setRecommendedPrograms(flattenCbResults(results))
    } catch (error) {
      if (error.status === 401) {
        handleAuthExpired()
        return
      }
      setApiError(error.message)
    } finally {
      setRecommendationsLoading(false)
    }
  }

  const handleCloseProgramDetail = () => {
    setShowProgramDetail(false)
    setActiveProgramId(null)
    setActiveAlternativeProgram(null)
  }

  const handleRevisitNoChange = () => {
    setShowRevisitModal(false)
  }

  const handleRevisitChanged = () => {
    localStorage.setItem(FOLLOWUP_PENDING_KEY, 'true')
    localStorage.removeItem(FOLLOWUP_COMPLETED_KEY)
    setCbResults(null)
    setShowRevisitModal(false)
    navigate('followup')
  }

  const handleRevisitSkipToday = () => {
    setShowRevisitModal(false)
  }

  const handleRestart = () => {
    setAnswers({})
    localStorage.removeItem(FOLLOWUP_PENDING_KEY)
    localStorage.removeItem(FOLLOWUP_COMPLETED_KEY)
    setCbResults(null)
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

  const handleNewSignupExit = async () => {
    if (apiLoading) return

    setApiLoading(true)
    setApiError('')

    try {
      await api.withdraw()
      localStorage.removeItem(FOLLOWUP_PENDING_KEY)
      localStorage.removeItem(FOLLOWUP_COMPLETED_KEY)
      setShowSignupExitModal(false)
      clearUserSession()
      navigate('onboarding')
    } catch (error) {
      setApiError(error.message || '회원가입 기록을 삭제하지 못했어요.')
    } finally {
      setApiLoading(false)
    }
  }

  const renderView = () => {
    if (view === 'diagnosis') {
      return (
        <DiagnosisPage
          answers={answers}
          onAnswer={handleAnswer}
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

    if (view === 'restoringSession') {
      return <SessionRestorePage />
    }

    if (view === 'result') {
      return (
        <ResultPage
          eligible={eligible}
          answers={answers}
          alternativePrograms={alternativePrograms}
          alternativesLoading={alternativesLoading}
          alternativesError={alternativesError}
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
          onRestart={handleRestart}
        />
      )
    }

    if (view === 'followup') {
      return (
        <FollowupQuestionPage
          user={user}
          onAuthExpired={handleAuthExpired}
          onResultsReady={(threadId) => handleCbResultsReady(threadId, 'followup')}
          onGoHome={user?.diagnosisCompleted === false ? () => setShowSignupExitModal(true) : undefined}
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
        <>
          <ProgramListPage
            programs={programs}
            savedProgramIds={savedProgramIds}
            user={user}
            error={apiError}
            splitRecommendations={Boolean(cbResults)}
            recommendationsLoading={recommendationsLoading}
            showSideChat={showSideChat}
            onOpenChat={() => navigate('programChat')}
            onOpenProgram={handleOpenProgram}
            openingProgramId={openingProgramId}
            onSaveProgram={handleSaveProgram}
          />
          {showProgramDetail ? (
            <ProgramDetailPage
              program={activeProgram}
              saved={savedProgramIds.includes(activeProgramId)}
              user={user}
              onBack={handleCloseProgramDetail}
              onSaveProgram={handleSaveProgram}
            />
          ) : null}
        </>
      )
    }

    if (view === 'programChat') {
      return (
        <ProgramChatPage
          user={user}
          onAuthExpired={handleAuthExpired}
          onResultsReady={(threadId) => handleCbResultsReady(threadId, 'programChat')}
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
      <Suspense fallback={null}>
        {renderView()}
      </Suspense>
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
      <Modal
        open={showSignupExitModal}
        title="회원가입 기록이 저장되지 않아요"
        primaryLabel={apiLoading ? '삭제 중...' : '예'}
        secondaryLabel="아니요"
        className="save-cancel-modal"
        onPrimary={handleNewSignupExit}
        onSecondary={() => setShowSignupExitModal(false)}
      >
        <p>메인으로 이동하면 방금 회원가입한 기록이 삭제됩니다.</p>
      </Modal>
    </PageShell>
  )
}

export default App
