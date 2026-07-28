import { ProgramCard } from '../components/programs/ProgramCard'
import chatIconImg from '../assets/chaticon.webp'
import noneSaveImg from '../assets/nonesave.webp'

export function ProgramListPage({
  programs,
  savedProgramIds,
  user,
  error,
  splitRecommendations,
  recommendationsLoading,
  onOpenChat,
  onOpenProgram,
  onSaveProgram,
}) {
  const savedPrograms = programs.filter((program) => savedProgramIds.includes(program.id))
  const recommendedPrograms = programs.filter((program) => !savedProgramIds.includes(program.id))
  const matchedPrograms = splitRecommendations
    ? recommendedPrograms.filter((program) => program.recommendationSection !== 'maybe')
    : recommendedPrograms
  const maybePrograms = splitRecommendations
    ? recommendedPrograms.filter((program) => program.recommendationSection === 'maybe')
    : []

  return (
    <section className="programs-page programs-page--recommendation">
      <div className="programs-main">
        <div className="page-heading">
          <h1>{user ? `${user.name}님의 맞춤 제도` : '맞춤 제도'}</h1>
          {error ? <p className="form-error">{error}</p> : null}
        </div>

        <section className={`selected-programs ${savedPrograms.length ? 'has-items' : 'is-empty'}`}>
          <button className="selected-programs__chat-button" type="button" onClick={onOpenChat} aria-label="상담 채팅 열기">
            <span className="selected-programs__chat-prompt" aria-hidden="true">
              혹시 더 필요한게 있으실까요?
            </span>
            <span className="selected-programs__chat-avatar">
              <img src={chatIconImg} alt="" aria-hidden="true" />
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

        <section className="program-section">
          {splitRecommendations || recommendationsLoading ? (
            <div className="program-section__heading">
              <h2>이런 제도들을 추천드려요!</h2>
            </div>
          ) : null}
          {recommendationsLoading ? (
            <div className="program-list__loading" role="status" aria-label="맞춤 제도를 불러오는 중입니다">
              <span className="program-list__loading-spinner" aria-hidden="true" />
            </div>
          ) : (
            <div className="program-list">
              {matchedPrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  saved={savedProgramIds.includes(program.id)}
                  onOpen={onOpenProgram}
                  onSave={onSaveProgram}
                />
              ))}
            </div>
          )}
        </section>

        {splitRecommendations && !recommendationsLoading && maybePrograms.length ? (
          <section className="program-section program-section--maybe">
            <div className="program-section__heading">
              <h2>이런 제도들은 어떠세요?</h2>
              <span>{maybePrograms.length}개 · 좌우로 넘겨보세요</span>
            </div>
            <div
              className="program-list program-list--horizontal"
              role="region"
              aria-label="이런 제도들은 어떠세요?"
              tabIndex="0"
            >
              {maybePrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  saved={savedProgramIds.includes(program.id)}
                  onOpen={onOpenProgram}
                  onSave={onSaveProgram}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  )
}
