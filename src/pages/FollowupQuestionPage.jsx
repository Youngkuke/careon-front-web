import { useEffect, useState } from 'react'
import { Button } from '../components/common/Button'
import { SideChatPanel } from '../components/layout/SideChatPanel'
import { api } from '../lib/api'

const READY_TRANSITION_DELAY = 3000

const waitForReadyTransition = () => new Promise((resolve) => {
  window.setTimeout(resolve, READY_TRANSITION_DELAY)
})

export function FollowupQuestionPage({ user, onAuthExpired, onResultsReady, onGoHome }) {
  const [threadId, setThreadId] = useState('')
  const [isSessionLoading, setIsSessionLoading] = useState(Boolean(user?.carerId))
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

  const handleSubmitMessage = async (message) => {
    if (!threadId) {
      return { message: '대화를 준비하고 있어요. 잠시 후 다시 입력해 주세요.' }
    }

    try {
      const response = await api.sendCbMessage(threadId, message)

      if (response.phase === 'ready') {
        await waitForReadyTransition()
        await onResultsReady(threadId)
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
      {onGoHome ? (
        <Button className="program-chat-page__back" variant="secondary" size="small" onClick={onGoHome}>
          메인으로
        </Button>
      ) : null}
      <SideChatPanel
        key={initialMessages.length}
        className="side-chat--full"
        animateBotMessages
        isWaiting={isSessionLoading}
        initialMessages={initialMessages}
        onSubmitMessage={handleSubmitMessage}
      />
    </section>
  )
}
