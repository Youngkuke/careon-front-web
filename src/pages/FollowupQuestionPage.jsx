import { SideChatPanel } from '../components/layout/SideChatPanel'

export function FollowupQuestionPage({ onComplete }) {
  const followupMessages = [
    {
      from: 'bot',
      text: '이제 조금 더 여쭤볼게요. 편하게 이야기해 주셔도 돼요.',
    },
    {
      from: 'bot',
      text: '지금 함께 살고 있는 분들이 어떻게 되시나요? 가족 구성이나 생활 상황을 편하게 말씀해 주세요.',
    },
  ]

  return (
    <section className="program-chat-page">
      <SideChatPanel
        className="side-chat--full"
        selectedTypes={[]}
        initialMessages={followupMessages}
        onSubmitMessage={onComplete}
      />
    </section>
  )
}
