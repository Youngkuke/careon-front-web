import { useState } from 'react'
import { Button } from '../common/Button'

const QUICK_QUESTIONS = [
  '신청 서류를 쉽게 알려줘',
  '내가 먼저 볼 제도는 뭐야?',
  '마감일 알림은 어떻게 받아?',
]

export function SideChatPanel({ userName, selectedTypes }) {
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: `${userName || '사용자'}님 상황에 맞춰 추천 제도를 같이 살펴볼게요. 궁금한 제도를 누르거나 질문을 골라 주세요.`,
    },
  ])

  const handleAsk = (question) => {
    const answer = selectedTypes.length
      ? '선택한 관심 유형을 기준으로 카드에 있는 신청 방법, 필요 서류, 마감 정보를 먼저 확인하면 좋아요. 실제 신청 전에는 주관 기관 공고도 함께 확인해 주세요.'
      : '관심 유형을 고르면 추천 범위를 좁힐 수 있어요. 지금은 전체 제도 기준으로 안내하고 있습니다.'

    setMessages((current) => [
      ...current,
      { from: 'user', text: question },
      { from: 'bot', text: answer },
    ])
  }

  return (
    <aside className="side-chat" aria-label="추천 제도 상담">
      <div className="side-chat__header">
        <strong>CareOn 상담</strong>
        <span>데모 응답</span>
      </div>
      <div className="side-chat__messages">
        {messages.map((message, index) => (
          <p key={`${message.from}-${index}`} className={`side-chat__message side-chat__message--${message.from}`}>
            {message.text}
          </p>
        ))}
      </div>
      <div className="side-chat__quick">
        {QUICK_QUESTIONS.map((question) => (
          <Button key={question} variant="secondary" size="small" onClick={() => handleAsk(question)}>
            {question}
          </Button>
        ))}
      </div>
    </aside>
  )
}
