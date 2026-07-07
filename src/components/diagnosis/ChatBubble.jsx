import chatbotImg from '../../assets/chatbot.webp'

export function ChatBubble({ children, tone = 'bot' }) {
  return (
    <div className={`chat-row chat-row--${tone}`}>
      {tone === 'bot' ? <img className="chat-avatar" src={chatbotImg} alt="" aria-hidden="true" /> : null}
      <div className={`chat-bubble chat-bubble--${tone}`}>{children}</div>
    </div>
  )
}
