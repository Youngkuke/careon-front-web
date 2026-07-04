import { useEffect, useRef, useState } from 'react'
import { DIAGNOSIS_QUESTIONS } from '../constants/diagnosisQuestions'
import { SUPPORT_TYPE_MAP } from '../constants/supportTypes'
import { ProgramCard } from '../components/programs/ProgramCard'
import { Button } from '../components/common/Button'
import { ChatBubble } from '../components/diagnosis/ChatBubble'

export function ResultPage({
  eligible,
  answers,
  selectedTypes,
  alternativePrograms,
  savedProgramIds,
  onAuth,
  onSignup,
  onOpenProgram,
  onSaveProgram,
  onRestart,
}) {
  const [showSkippedPrograms, setShowSkippedPrograms] = useState(false)
  const logRef = useRef(null)
  const failedQuestions = DIAGNOSIS_QUESTIONS.filter((question) => answers[question.id] === false)
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
                  <p className="auth-choice-caption">계정을 만들면 진단 결과와 관심 제도를 이어서 확인할 수 있어요.</p>
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
                  {alternativePrograms.map((program) => (
                    <ProgramCard
                      key={program.id}
                      program={program}
                      saved={savedProgramIds.includes(program.id)}
                      onOpen={onOpenProgram}
                      onSave={onSaveProgram}
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
              <strong>몇 가지 조건을 함께 보면 가족돌봄청년 대상 기준과는 조금 달라요.</strong>
              <p>그래도 지금 선택한 관심 유형과 가까운 대안 제도를 먼저 확인해 볼 수 있습니다.</p>
            </ChatBubble>
            <div className="reason-list reason-list--chat">
              {failedQuestions.map((question) => (
                <p key={question.id}>{question.failReason}</p>
              ))}
            </div>
            <div className="alternative-list alternative-list--chat">
              {alternativePrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  saved={savedProgramIds.includes(program.id)}
                  onOpen={onOpenProgram}
                  onSave={onSaveProgram}
                />
              ))}
            </div>
            <ChatBubble>
              <strong>필요하다면 처음부터 다시 확인해볼 수도 있어요.</strong>
            </ChatBubble>
          </div>
        </div>
        <div className="conversation-actions">
          <Button variant="ghost" onClick={onRestart}>
            다시 진단하기
          </Button>
        </div>
      </div>
    </section>
  )
}
