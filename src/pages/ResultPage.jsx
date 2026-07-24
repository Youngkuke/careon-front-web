import { useEffect, useRef, useState } from 'react'
import { DIAGNOSIS_QUESTIONS } from '../constants/diagnosisQuestions'
import { SUPPORT_TYPE_MAP } from '../constants/supportTypes'
import { OverflowText, ProgramCard } from '../components/programs/ProgramCard'
import { Button } from '../components/common/Button'
import { ChatBubble } from '../components/diagnosis/ChatBubble'

const INELIGIBLE_MESSAGES = {
  age: '아쉽게도 나이 기준(9~39세)에 맞지 않아 서울시 가족돌봄청년 특화 지원은 받기 어려워요.\n하지만 걱정 마세요!\n연령과 무관하게 혜택을 받을 수 있는 돌봄 서비스들을 모아봤어요',
  seoul: '현재 서울시에 거주하고 계시지 않아 서울시 특화 지원금(자기돌봄비 등) 대상에서는 제외되었어요.\n대신, 전국 어디서나 신청 가능한 국가 지원 사업들을 안내해 드릴게요',
  dailyDifficulty: '돌보시는 가족분이 혼자서도 일상생활이 가능하시다면, \'가족돌봄청년(영케어러)\' 전담 지원 대상에는 포함되지 않아요.\n혹시 구직이나 경제적인 부분으로 고민이시라면, 청년들을 위한 일반 복지 제도를 확인해 보세요',
  legalFamily: '가족이 아닌 분을 정성껏 돌보고 계시는군요!\n가족돌봄청년 특화 사업은 법적인 \'가족\'을 기준으로 하고 있어 신청이 조금 어려울 수 있어요.\n하지만 돌봄 대상자 본인이 직접 신청할 수 있는 서비스들을 알려드릴게요.\n돌보시는 분께 이 제도를 전해 주시면 어떨까요?',
  careResponsibility: '아프신 가족이 있지만, 다행히 전적으로 돌봄이나 생계를 책임지고 계시지는 않군요!\n가족돌봄청년 지원금 대상은 아니지만, 사용자님의 건강한 일상을 응원하며 도움이 될 만한 혜택들을 추천해 드려요',
  lifeDifficulty: '가족을 돌보시면서도 본인의 일상과 삶의 균형을 훌륭하게 유지하고 계시는군요!\n하지만 현재 가족돌봄청년 전담 지원은 당장 경제적·심리적 위기에 처해 일상이 멈춘 분들을 우선적으로 돕고 있어요.\n혹시라도 지치거나 도움이 필요해지면 언제든 다시 찾아주세요!',
}

const MULTIPLE_INELIGIBLE_MESSAGE = '서울시 가족돌봄청년 지원은 지금 가장 어려움이 큰 분들을 먼저 도와드리기 위해 몇 가지 조건을 함께 보고 있어요!\n필요한 다른 지원들을 안내 드릴게요!'
const FINAL_INELIGIBLE_MESSAGE = '저희는 여기까지 안내해 드릴 수 있어요.\n또 필요한 순간이 오면, 그때 다시 찾아주세요.'

function AlternativeWelfareCard({ program }) {
  const type = SUPPORT_TYPE_MAP[program.type]

  return (
    <article className="welfare-link-card">
      <div className="program-card__meta">
        <span>{type?.shortLabel}</span>
      </div>
      <OverflowText as="h3" className="program-card__title">{program.title}</OverflowText>
      <OverflowText as="p" className="program-card__summary">{program.summary}</OverflowText>
      <a href={program.url} target="_blank" rel="noreferrer">
        제도 링크 보기
      </a>
    </article>
  )
}

export function ResultPage({
  eligible,
  answers,
  selectedTypes,
  alternativePrograms,
  alternativesLoading,
  alternativesError,
  savedProgramIds,
  onLoadAlternatives,
  onAuth,
  onSignup,
  onOpenProgram,
}) {
  const [showSkippedPrograms, setShowSkippedPrograms] = useState(false)
  const logRef = useRef(null)
  const failedQuestions = DIAGNOSIS_QUESTIONS.filter((question) => answers[question.id] === false)
  const ineligibleMessage = failedQuestions.length > 1
    ? MULTIPLE_INELIGIBLE_MESSAGE
    : INELIGIBLE_MESSAGES[failedQuestions[0]?.id]
  const showAlternativeCards = failedQuestions.length > 0
  const selectedTypeLabels = selectedTypes
    .map((typeId) => SUPPORT_TYPE_MAP[typeId]?.shortLabel)
    .filter(Boolean)
  const selectedTypeText = selectedTypeLabels.length
    ? selectedTypeLabels.slice(0, 2).map((label) => `[${label}]`).join('와 ')
    : '[관심]'

  useEffect(() => {
    if (!logRef.current) return
    logRef.current.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [showSkippedPrograms])

  useEffect(() => {
    if (eligible || !showAlternativeCards) return
    onLoadAlternatives()
  }, [eligible, onLoadAlternatives, showAlternativeCards])

  useEffect(() => {
    if (!showSkippedPrograms) return
    onLoadAlternatives()
  }, [onLoadAlternatives, showSkippedPrograms])

  const renderAlternativeState = () => {
    if (alternativesLoading) {
      return <p className="empty-state">대체 제도를 불러오고 있어요.</p>
    }

    if (alternativesError) {
      return <p className="form-error">{alternativesError}</p>
    }

    if (!alternativePrograms.length) {
      return <p className="empty-state">표시할 대체 제도가 없어요.</p>
    }

    return null
  }

  if (eligible) {
    return (
      <section className="flow-page">
        <div className="flow-card result-chat-card">
          <div className="conversation-log" ref={logRef}>
            <div className="conversation-turn">
              <ChatBubble>
                <strong>
                  사용자님은 가족돌봄청년에 해당돼요!<br />
                  특히 궁금해하신 {selectedTypeText} 유형을 중심으로 제도를 찾아드릴게요.
                </strong>
              </ChatBubble>
              <ChatBubble>
                <strong>
                  이제 조금 더 자세한 상황을 들어보려고 해요.<br />
                  회원가입을 통해 사용자님의 결과를 저장하고, 맞춤형 제도를 받아보세요!
                </strong>
              </ChatBubble>
              {!showSkippedPrograms ? (
                <div className="auth-choice-panel">
                  <div className="auth-choice-line" aria-hidden="true" />
                  <div className="auth-choice-buttons">
                    <Button className="auth-choice-primary" size="large" onClick={onSignup}>회원가입</Button>
                    <Button className="auth-choice-secondary" variant="ghost" size="large" onClick={onAuth}>로그인</Button>
                  </div>
                  <button className="later-link" type="button" onClick={() => setShowSkippedPrograms(true)}>
                    나중에 할게요 (결과가 저장되지 않아요)
                  </button>
                </div>
              ) : null}
            </div>

            {showSkippedPrograms ? (
              <div className="conversation-turn">
                <ChatBubble>
                  <strong>괜찮아요. 선택하신 유형을 바탕으로 맞을 것 같은 제도들을 찾아봤어요.</strong>
                </ChatBubble>
                <div className="alternative-list alternative-list--chat">
                  {renderAlternativeState() || alternativePrograms.map((program) => (
                    <ProgramCard
                      key={program.id}
                      program={program}
                      saved={savedProgramIds.includes(program.id)}
                      onOpen={onOpenProgram}
                    />
                  ))}
                </div>
                <ChatBubble>
                  <strong>
                    결과를 저장하고 더 정확한 제도를 찾아드리려면 로그인이 필요해요.<br />
                    나중에 다시 오셔도 언제든 도와드릴게요.
                  </strong>
                </ChatBubble>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="flow-page">
      <div className="flow-card result-chat-card">
        <div className="conversation-log" ref={logRef}>
          <div className="conversation-turn">
            <ChatBubble>
              <strong>가족돌봄청년 지원 대상은 아니라는 점을 먼저 안내드려요.</strong>
              <p>{ineligibleMessage}</p>
            </ChatBubble>
            {showAlternativeCards ? (
              <div className="alternative-list alternative-list--chat">
                {renderAlternativeState() || alternativePrograms.map((program) => (
                  <AlternativeWelfareCard key={program.id} program={program} />
                ))}
              </div>
            ) : null}
            <ChatBubble>
              <strong>{FINAL_INELIGIBLE_MESSAGE}</strong>
            </ChatBubble>
          </div>
        </div>
      </div>
    </section>
  )
}
