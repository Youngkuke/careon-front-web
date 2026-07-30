import { useEffect, useState } from 'react'
import { Button } from '../components/common/Button'
import { SideChatPanel } from '../components/layout/SideChatPanel'
import { api } from '../lib/api'

const READY_TRANSITION_DELAY = 3000
const READY_TRANSITION_SECONDS = READY_TRANSITION_DELAY / 1000

export function ProgramChatPage({
  user,
  onAuthExpired,
  onResultsReady,
  onBack,
}) {
  const [threadId, setThreadId] = useState('')
  const [isSessionLoading, setIsSessionLoading] = useState(Boolean(user?.carerId))
  const [isReadyTransitioning, setIsReadyTransitioning] = useState(false)
  const [readyTransitionSeconds, setReadyTransitionSeconds] = useState(null)
  const [initialMessages, setInitialMessages] = useState([])

  useEffect(() => {
    let ignore = false

    const createThread = async () => {
      if (!user) {
        setIsSessionLoading(false)
        return
      }

      setIsSessionLoading(true)

      try {
        const thread = await api.createCbThread()
        if (ignore) return

        setThreadId(thread.threadId)
        if (thread.message) {
          setInitialMessages((current) => [
            ...current,
            { from: 'bot', text: thread.message },
          ])
        }
      } catch (error) {
        if (error.status === 401) {
          onAuthExpired()
          return
        }

        if (!ignore) {
          setInitialMessages((current) => [
            ...current,
            { from: 'bot', text: error.message },
          ])
        }
      } finally {
        if (!ignore) {
          setIsSessionLoading(false)
        }
      }
    }

    createThread()

    return () => {
      ignore = true
    }
  }, [onAuthExpired, user])

  useEffect(() => {
    if (!isReadyTransitioning) return undefined

    setReadyTransitionSeconds(READY_TRANSITION_SECONDS)
    const countdownTimer = window.setInterval(() => {
      setReadyTransitionSeconds((current) => Math.max((current ?? 0) - 1, 0))
    }, 1000)
    const transitionTimer = window.setTimeout(() => {
      window.clearInterval(countdownTimer)
      void onResultsReady(threadId)
    }, READY_TRANSITION_DELAY)

    return () => {
      window.clearInterval(countdownTimer)
      window.clearTimeout(transitionTimer)
    }
  }, [isReadyTransitioning, onResultsReady, threadId])

  const handleSubmitMessage = async (message) => {
    if (!threadId) {
      return { message: '상담 세션을 준비하고 있어요. 잠시 후 다시 입력해 주세요.' }
    }

    try {
      const response = await api.sendCbMessage(threadId, message)

      if (response.phase === 'ready') {
        setIsReadyTransitioning(true)
      }

      return response
    } catch (error) {
      if (error.status === 401) onAuthExpired()

      if (error.status === 404) {
        const thread = await api.createCbThread()
        setThreadId(thread.threadId)
        return { message: '대화가 만료되어 새로 시작했어요. 다시 말씀해 주세요.' }
      }

      throw error
    }
  }

  return (
    <section className="program-chat-page">
      <Button className="program-chat-page__back" variant="secondary" size="small" onClick={onBack}>
        돌아가기
      </Button>
      <SideChatPanel
        key={initialMessages.length}
        className="side-chat--full"
        userName={user?.name}
        animateBotMessages
        isWaiting={isSessionLoading}
        inputDisabled={isReadyTransitioning}
        transitionCountdown={isReadyTransitioning ? readyTransitionSeconds : null}
        initialMessages={initialMessages}
        onSubmitMessage={handleSubmitMessage}
      />
    </section>
  )
}
