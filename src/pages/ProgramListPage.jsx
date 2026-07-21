import { useMemo } from 'react'
import { SUPPORT_TYPES } from '../constants/supportTypes'
import { ProgramCard } from '../components/programs/ProgramCard'
import { ProgramSection } from '../components/programs/ProgramSection'
import chatbotImg from '../assets/chatbot.webp'
import noneSaveImg from '../assets/nonesave.webp'

const SUPPORT_TYPE_ORDER = SUPPORT_TYPES.map((type) => type.id)

export function ProgramListPage({
  programs,
  selectedTypes,
  savedProgramIds,
  user,
  error,
  onOpenChat,
  onOpenProgram,
  onSaveProgram,
}) {
  const orderedTypes = selectedTypes.length ? selectedTypes : SUPPORT_TYPE_ORDER
  const orderedPrograms = useMemo(() => (
    [...programs].sort((a, b) => SUPPORT_TYPE_ORDER.indexOf(a.type) - SUPPORT_TYPE_ORDER.indexOf(b.type))
  ), [programs])
  const savedPrograms = programs.filter((program) => savedProgramIds.includes(program.id))

  return (
    <section className="programs-page programs-page--recommendation">
      <div className="programs-main">
        <div className="page-heading">
          <h1>{user ? `${user.name}님의 맞춤 제도` : '맞춤 제도'}</h1>
          {error ? <p className="form-error">{error}</p> : null}
        </div>

        <section className={`selected-programs ${savedPrograms.length ? 'has-items' : 'is-empty'}`}>
          <button className="selected-programs__chat-button" type="button" onClick={onOpenChat} aria-label="상담 채팅 열기">
            <span className="selected-programs__chat-avatar">
              <img src={chatbotImg} alt="" aria-hidden="true" />
            </span>
          </button>
          <div className="selected-programs__header">
            <span>내가 선택한 제도{savedPrograms.length ? ` ${savedPrograms.length}개` : ''}</span>
          </div>
          {savedPrograms.length ? (
            <div className="program-list program-list--compact">
              {savedPrograms.map((program) => (
                <ProgramCard key={program.id} program={program} saved onOpen={onOpenProgram} onSave={onSaveProgram} />
              ))}
            </div>
          ) : (
            <div className="selected-programs__empty">
              <img src={noneSaveImg} alt="" aria-hidden="true" />
              <strong>
                원하시는 제도를 선택해 저장하세요<br />
                앱에서 확인할 수 있어요
              </strong>
            </div>
          )}
        </section>

        <div className="program-sections">
          {orderedTypes.map((typeId) => (
            <ProgramSection
              key={typeId}
              typeId={typeId}
              programs={orderedPrograms.filter((program) => program.type === typeId)}
              savedProgramIds={savedProgramIds}
              onOpenProgram={onOpenProgram}
              onSaveProgram={onSaveProgram}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
