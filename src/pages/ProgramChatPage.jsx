import { useEffect, useState } from 'react'
import { Button } from '../components/common/Button'
import { SideChatPanel } from '../components/layout/SideChatPanel'
import { api } from '../lib/api'

const createInitialMessages = (userName) => [
  {
    from: 'bot',
    text: `${userName || '사용자'}님 상황이 바뀌었다면 편하게 말씀해 주세요. 소득, 주거, 돌봄 시간, 가족 구성처럼 달라진 내용을 반영해 다시 살펴볼게요.`,
  },
]

export function ProgramChatPage({
  user,
  selectedTypes,
  onAuthExpired,
  onMatchedPoliciesRefresh,
  onBack,
}) {
  const [sessionId, setSessionId] = useState('')
  const [isSessionLoading, setIsSessionLoading] = useState(Boolean(user?.carerId))
  const [initialMessages, setInitialMessages] = useState(() => createInitialMessages(user?.name))

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

  const refreshMatchedPolicies = async () => {
    if (typeof onMatchedPoliciesRefresh !== 'function') return
    await onMatchedPoliciesRefresh()
  }

  const handleSubmitMessage = async (message) => {
    if (!sessionId) {
      return { message: '상담 세션을 준비하고 있어요. 잠시 후 다시 입력해 주세요.' }
    }

    const response = await api.sendChatMessage(sessionId, message)

    if (response.phase === 'ready_to_match') {
      await api.matchChatSession(sessionId)
      await refreshMatchedPolicies()
      return {
        ...response,
        message: `${response.message || '상황을 반영했어요.'} 맞춤 제도를 새로 살펴봤어요.`,
      }
    }

    if (response.phase === 'done') {
      await refreshMatchedPolicies()
    }

    return response
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
        selectedTypes={selectedTypes}
        animateBotMessages
        isWaiting={isSessionLoading}
        initialMessages={initialMessages}
        onSubmitMessage={handleSubmitMessage}
      />
    </section>
  )
}
