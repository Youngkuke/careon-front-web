import { ProgramDetailPanel } from '../components/programs/ProgramDetailPanel'
import { SideChatPanel } from '../components/layout/SideChatPanel'

export function ProgramDetailPage({ program, saved, user, selectedTypes, onBack, onSaveProgram }) {
  const insightMessages = [
    {
      from: 'bot',
      text: program
        ? `${program.title}은(는) ${program.agency}에서 운영하는 제도예요. 신청 전에는 신청 기간과 필요 서류를 먼저 확인해 주세요.`
        : '아직 선택한 제도가 없어요. 궁금한 제도를 열어보거나 검색해보세요.',
    },
    {
      from: 'bot',
      text: program
        ? `준비 팁: ${program.documentGuide} 특이사항은 ${program.note} ${program.duplicateRule}`
        : '맞춤 제도를 저장하면 이곳에서 추가 정보를 확인할 수 있어요.',
    },
  ]

  return (
    <section className="program-detail-page">
      <div className="program-detail-main">
        <ProgramDetailPanel key={program?.id || 'empty'} program={program} saved={saved} user={user} onBack={onBack} onSave={onSaveProgram} />
      </div>
      <div className="program-detail-insight">
        <SideChatPanel
          className="side-chat--embedded side-chat--readonly"
          userName={user?.name}
          selectedTypes={selectedTypes}
          initialMessages={insightMessages}
          readOnly
        />
      </div>
    </section>
  )
}
