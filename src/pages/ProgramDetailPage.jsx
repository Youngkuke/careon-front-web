import { ProgramDetailPanel } from '../components/programs/ProgramDetailPanel'
import { SideChatPanel } from '../components/layout/SideChatPanel'

export function ProgramDetailPage({ program, saved, user, selectedTypes, onBack, onSaveProgram }) {
  return (
    <section className="programs-page">
      <div className="programs-main">
        <ProgramDetailPanel program={program} saved={saved} user={user} onBack={onBack} onSave={onSaveProgram} />
      </div>
      <div className="side-chat-slot">
        <SideChatPanel userName={user?.name} selectedTypes={selectedTypes} />
      </div>
    </section>
  )
}
