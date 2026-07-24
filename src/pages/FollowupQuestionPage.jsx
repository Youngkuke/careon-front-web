import { useEffect, useState } from 'react'
import { SideChatPanel } from '../components/layout/SideChatPanel'
import { api } from '../lib/api'

export function FollowupQuestionPage({ user, onAuthExpired, onComplete }) {
  const [sessionId, setSessionId] = useState('')
  const [isSessionLoading, setIsSessionLoading] = useState(Boolean(user?.carerId))
  const [initialMessages, setInitialMessages] = useState([])

  useEffect(() => {
    let ignore = false

    const createSession = async () => {
      if (!user?.carerId) {
        setIsSessionLoading(false)
        return
      }

      setIsSessionLoading(true)

      try {
        const session = await api.createChatSession(user.carerId)
        if (ignore) return

        setSessionId(session.sessionId)
        if (session.message) {
          setInitialMessages((current) => [
            ...current,
            { from: 'bot', text: session.message },
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

    createSession()

    return () => {
      ignore = true
    }
  }, [onAuthExpired, user?.carerId])

  const handleSubmitMessage = async (message) => {
    if (!sessionId) {
      return { message: '진단 세션을 준비하고 있어요. 잠시 후 다시 입력해 주세요.' }
    }

    const response = await api.sendChatMessage(sessionId, message)

    if (response.phase === 'ready_to_match') {
      await api.matchChatSession(sessionId)
      await onComplete()
    }

    if (response.phase === 'done') {
      await onComplete()
    }

    return response
  }

  return (
    <section className="program-chat-page">
      <SideChatPanel
        key={initialMessages.length}
        className="side-chat--full"
        selectedTypes={[]}
        animateBotMessages
        isWaiting={isSessionLoading}
        initialMessages={initialMessages}
        onSubmitMessage={handleSubmitMessage}
      />
    </section>
  )
}
