import { useEffect, useState } from 'react'
import { ProgramDetailPanel } from '../components/programs/ProgramDetailPanel'
import { SideChatPanel } from '../components/layout/SideChatPanel'
import { api } from '../lib/api'

export function ProgramDetailPage({ program, saved, user, onBack, onSaveProgram }) {
  const [translationMessage, setTranslationMessage] = useState('')
  const [isTranslationLoading, setIsTranslationLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    const loadTranslation = async () => {
      if (!program?.id || !user) {
        setTranslationMessage('')
        setIsTranslationLoading(false)
        return
      }

      setTranslationMessage('')
      setIsTranslationLoading(true)

      try {
        const response = program.servId
          ? await api.translateCbInstitution(program.servId)
          : await api.translatePolicy(program.id)

        if (!ignore) {
          setTranslationMessage(
            program.servId
              ? response.easy_text || response.easyText || ''
              : response.explanation || '',
          )
        }
      } catch (error) {
        if (!ignore) {
          setTranslationMessage(error.message || '쉬운 설명을 불러오지 못했어요.')
        }
      } finally {
        if (!ignore) {
          setIsTranslationLoading(false)
        }
      }
    }

    loadTranslation()

    return () => {
      ignore = true
    }
  }, [program?.id, program?.servId, user])

  const insightMessages = [
    {
      from: 'bot',
      text: program
        ? `${program.title}은(는) ${program.agency}에서 운영하는 제도예요. 신청 전에는 신청 기간과 공식 안내를 먼저 확인해 주세요.`
        : '아직 선택한 제도가 없어요. 궁금한 제도를 열어보거나 검색해보세요.',
    },
    {
      from: 'bot',
      text: program
        ? `준비 팁: 신청 조건과 특이사항을 공식 안내에서 확인해 주세요. ${program.note} ${program.duplicateRule}`
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
          title="이 제도를 쉽게 설명해드릴게요!"
          userName={user?.name}
          initialMessages={insightMessages}
          isWaiting={isTranslationLoading}
          readOnly
        />
      </div>
    </section>
  )
}
