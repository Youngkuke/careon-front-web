import { SideChatPanel } from '../components/layout/SideChatPanel'

export function ProgramChatPage({ user, selectedTypes, onBack }) {
  return (
    <section className="program-chat-page">
      <SideChatPanel
        className="side-chat--full"
        userName={user?.name}
        selectedTypes={selectedTypes}
        onBack={onBack}
      />
    </section>
  )
}
