import { useEffect, useRef, useState } from 'react'
import { Button } from '../common/Button'
import chatbotImg from '../../assets/chatbot.svg'

export function SideChatPanel({ userName, selectedTypes }) {
  const messagesRef = useRef(null)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState([
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
  }, [messages])

  const handleSubmit = (event) => {
    event.preventDefault()
    const question = draft.trim()
    if (!question) return

    const answer = selectedTypes.length
      ? '선택한 관심 유형을 기준으로 카드에 있는 신청 방법, 필요 서류, 마감 정보를 먼저 확인하면 좋아요. 실제 신청 전에는 주관 기관 공고도 함께 확인해 주세요.'
      : '관심 유형을 고르면 추천 범위를 좁힐 수 있어요. 지금은 전체 제도 기준으로 안내하고 있습니다.'

    setDraft('')
    setMessages((current) => [
      ...current,
      { from: 'user', text: question },
      { from: 'bot', text: answer },
    ])
  }

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
  }

  return (
    <aside className="side-chat" aria-label="추천 제도 상담">
      <div className="side-chat__header">
        <strong>CareOn 상담</strong>
      </div>
      <div className="side-chat__messages" ref={messagesRef}>
        {messages.map((message, index) => (
          <div key={`${message.from}-${index}`} className={`side-chat__row side-chat__row--${message.from}`}>
            {message.from === 'bot' ? <img className="side-chat__avatar" src={chatbotImg} alt="" aria-hidden="true" /> : null}
            <p className={`side-chat__message side-chat__message--${message.from}`}>
              {message.text}
            </p>
          </div>
        ))}
      </div>
      <form className="side-chat__form" onSubmit={handleSubmit}>
        <label className="side-chat__input">
          <textarea
            aria-label="상담 질문"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="예) 신청 서류를 쉽게 알려줘"
            rows={1}
          />
        </label>
        <Button className="side-chat__send" type="submit" size="small" disabled={!draft.trim()} aria-label="보내기">
          ↑
        </Button>
      </form>
    </aside>
  )
}
