import { useEffect, useState } from 'react'
import { SideChatPanel } from '../components/layout/SideChatPanel'
import { api, normalizePolicy } from '../lib/api'

export function FollowupQuestionPage({ user, onAuthExpired, onComplete }) {
  const [sessionId, setSessionId] = useState('')
  const [initialMessages, setInitialMessages] = useState([
    {
      from: 'bot',
      text: '이제 조금 더 여쭤볼게요. 편하게 이야기해 주셔도 돼요.',
    },
    {
      from: 'bot',
      text: '지금 함께 살고 있는 분들이 어떻게 되시나요? 가족 구성이나 생활 상황을 편하게 말씀해 주세요.',
    },
  ])

  useEffect(() => {
    let ignore = false

    const createSession = async () => {
      if (!user?.carerId) return

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
      const matchResult = await api.matchChatSession(sessionId)
      const policyIds = matchResult.matches
        .map((match) => match.policyId)
        .filter((policyId) => Number.isSafeInteger(Number(policyId)))
      const matchedPrograms = policyIds.length
        ? (await api.getPoliciesByIds(policyIds)).map(normalizePolicy)
        : []

      await onComplete(matchedPrograms)
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
        initialMessages={initialMessages}
        onSubmitMessage={handleSubmitMessage}
      />
    </section>
  )
}
