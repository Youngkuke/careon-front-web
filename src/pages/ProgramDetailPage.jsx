import { useEffect, useState } from 'react'
import { ProgramDetailPanel } from '../components/programs/ProgramDetailPanel'
import { SideChatPanel } from '../components/layout/SideChatPanel'
import { api } from '../lib/api'

const formatApplyGuide = (text = '') => text.trim()

export function ProgramDetailPage({ program, saved, user, onBack, onSaveProgram }) {
  const [translationMessages, setTranslationMessages] = useState([])
  const [isTranslationLoading, setIsTranslationLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    const loadTranslation = async () => {
      if (!program?.id || !user) {
        setTranslationMessages([])
        setIsTranslationLoading(false)
        return
      }

      setTranslationMessages([])
      setIsTranslationLoading(true)

      try {
        const response = program.servId
          ? await api.translateCbInstitution(program.servId)
          : await api.translatePolicy(program.id)

        if (!ignore) {
          if (program.servId) {
            const applyGuide = formatApplyGuide(response?.apply_guide_easy
              || response?.applyGuideEasy
              || response?.data?.apply_guide_easy
              || response?.data?.applyGuideEasy
              || program.applyGuideEasy
              || '')
            const easyText = response?.easy_text
              || response?.easyText
              || response?.data?.easy_text
              || response?.data?.easyText
              || ''

            setTranslationMessages([
              ...(easyText ? [easyText] : []),
              ...(applyGuide && applyGuide !== easyText ? [applyGuide] : []),
            ])
          } else {
            setTranslationMessages(response?.explanation ? [response.explanation] : [])
          }
        }
      } catch (error) {
        if (!ignore) {
          setTranslationMessages([error.message || '쉬운 설명을 불러오지 못했어요.'])
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
  }, [program?.applyGuideEasy, program?.id, program?.servId, user])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onBack()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onBack])

  const insightMessages = translationMessages.map((text) => ({ from: 'bot', text }))

  return (
    <div className="program-detail-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onBack()
    }}>
      <section className="program-detail-page" role="dialog" aria-modal="true" aria-label="제도 상세">
        <div className="program-detail-main">
          <ProgramDetailPanel key={program?.id || 'empty'} program={program} saved={saved} user={user} onBack={onBack} onSave={onSaveProgram} />
        </div>
        <div className="program-detail-insight">
          <SideChatPanel
            key={`${program?.id || 'empty'}-${insightMessages.length}-${translationMessages.join('-')}`}
            className="side-chat--embedded side-chat--readonly"
            title="이 제도를 쉽게 설명해드릴게요!"
            userName={user?.name}
            initialMessages={insightMessages}
            isWaiting={isTranslationLoading}
            readOnly
          />
        </div>
      </section>
    </div>
  )
}
