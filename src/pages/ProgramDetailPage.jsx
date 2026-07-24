import { useEffect, useState } from 'react'
import { ProgramDetailPanel } from '../components/programs/ProgramDetailPanel'
import { SideChatPanel } from '../components/layout/SideChatPanel'
import { api } from '../lib/api'

export function ProgramDetailPage({ program, saved, user, selectedTypes, onBack, onSaveProgram }) {
  const [translationMessage, setTranslationMessage] = useState('')

  useEffect(() => {
    let ignore = false

    const loadTranslation = async () => {
      if (!program?.id || !user) {
        setTranslationMessage('')
        return
      }

      setTranslationMessage('제도를 쉬운 말로 풀어보고 있어요.')

      try {
        const response = await api.translatePolicy(program.id)
        if (!ignore) {
          setTranslationMessage(response.explanation || '')
        }
      } catch (error) {
        if (!ignore) {
          setTranslationMessage(error.message || '쉬운 설명을 불러오지 못했어요.')
        }
      }
    }

    loadTranslation()

    return () => {
      ignore = true
    }
  }, [program?.id, user])

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
    ...(translationMessage ? [{
      from: 'bot',
      text: translationMessage,
    }] : []),
  ]

  return (
    <section className="program-detail-page">
      <div className="program-detail-main">
        <ProgramDetailPanel key={program?.id || 'empty'} program={program} saved={saved} user={user} onBack={onBack} onSave={onSaveProgram} />
      </div>
      <div className="program-detail-insight">
        <SideChatPanel
          key={`${program?.id || 'empty'}-${insightMessages.length}-${translationMessage}`}
          className="side-chat--embedded side-chat--readonly"
          title="제도번역기"
          userName={user?.name}
          selectedTypes={selectedTypes}
          initialMessages={insightMessages}
          readOnly
        />
      </div>
    </section>
  )
}
