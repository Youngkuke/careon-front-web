import { useEffect, useRef, useState } from 'react'
import { Button } from '../common/Button'
import chatbotImg from '../../assets/chatbot.webp'

function TypingMessage({ text, onProgress }) {
  const [visibleText, setVisibleText] = useState('')

  useEffect(() => {
    const characters = Array.from(text)
    let characterIndex = 0

    const intervalId = window.setInterval(() => {
      characterIndex += 1
      setVisibleText(characters.slice(0, characterIndex).join(''))

      if (characterIndex >= characters.length) {
        window.clearInterval(intervalId)
      }
    }, 20)

    return () => window.clearInterval(intervalId)
  }, [text])

  useEffect(() => {
    onProgress?.()
  }, [onProgress, visibleText])

  return visibleText
}

export function SideChatPanel({
  userName,
  className = '',
  onBack,
  readOnly = false,
  animateBotMessages = false,
  isWaiting = false,
  title = '',
  headerAction,
  initialMessages,
  onSubmitMessage,
}) {
  const messagesRef = useRef(null)
  const isComposingRef = useRef(false)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState(initialMessages || [
    {
      from: 'bot',
      text: `${userName || '사용자'}님 상황에 맞춰 추천 제도를 같이 살펴볼게요. 궁금한 내용을 편하게 입력해 주세요.`,
    },
  ])

  useEffect(() => {
    if (!messagesRef.current) return
    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [isWaiting, messages, sending])

  const scrollMessagesToBottom = () => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: 'auto',
    })
  }

  const appendBotMessage = (text) => {
    if (!text) return
    setMessages((current) => [
      ...current,
      { from: 'bot', text },
    ])
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const question = draft.trim()
    if (!question || sending || isWaiting) return

    setDraft('')
    setMessages((current) => [
      ...current,
      { from: 'user', text: question },
    ])

    if (typeof onSubmitMessage === 'function') {
      setSending(true)
      try {
        const response = await onSubmitMessage(question)
        appendBotMessage(typeof response === 'string' ? response : response?.message)
      } catch (error) {
        appendBotMessage(error.message)
      } finally {
        setSending(false)
      }
      return
    }

    const answer = '카드에 있는 신청 방법, 필요 서류, 마감 정보를 먼저 확인하면 좋아요. 실제 신청 전에는 주관 기관 공고도 함께 확인해 주세요.'

    appendBotMessage(answer)
  }

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter' || event.shiftKey) return

    if (event.nativeEvent.isComposing || event.keyCode === 229 || isComposingRef.current) {
      return
    }

    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
  }

  return (
    <aside className={`side-chat ${className}`} aria-label="추천 제도 상담">
      {title || onBack || headerAction ? (
        <div className="side-chat__header">
          {title ? <strong>{title}</strong> : <span />}
          {headerAction || (onBack ? (
            <Button variant="secondary" size="small" onClick={onBack}>
              돌아가기
            </Button>
          ) : null)}
        </div>
      ) : null}
      <div className="side-chat__messages" ref={messagesRef}>
        {messages.map((message, index) => (
          <div key={`${message.from}-${index}`} className={`side-chat__row side-chat__row--${message.from}`}>
            {message.from === 'bot' ? <img className="side-chat__avatar" src={chatbotImg} alt="" aria-hidden="true" /> : null}
            <p className={`side-chat__message side-chat__message--${message.from}`}>
              {message.from === 'bot' && animateBotMessages && index === messages.length - 1 ? (
                <TypingMessage
                  text={message.text}
                  onProgress={scrollMessagesToBottom}
                />
              ) : message.text}
            </p>
          </div>
        ))}
        {sending || isWaiting ? (
          <div className="side-chat__row side-chat__row--bot side-chat__row--typing" role="status" aria-label="챗봇이 입력 중입니다">
            <img className="side-chat__avatar" src={chatbotImg} alt="" aria-hidden="true" />
            <div className="side-chat__typing" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : null}
      </div>
      {!readOnly ? (
        <form className="side-chat__form" onSubmit={handleSubmit}>
          <label className="side-chat__input">
            <textarea
              aria-label="상담 질문"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onCompositionStart={() => {
                isComposingRef.current = true
              }}
              onCompositionEnd={() => {
                window.setTimeout(() => {
                  isComposingRef.current = false
                }, 0)
              }}
              onKeyDown={handleKeyDown}
              placeholder="예) 신청 서류를 쉽게 알려줘"
              rows={1}
            />
          </label>
          <Button className="side-chat__send" type="submit" size="small" disabled={!draft.trim() || sending || isWaiting} aria-label="보내기">
            ↑
          </Button>
        </form>
      ) : null}
    </aside>
  )
}
