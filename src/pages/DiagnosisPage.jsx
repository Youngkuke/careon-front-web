import { useEffect, useRef } from 'react'
import { DIAGNOSIS_QUESTIONS } from '../constants/diagnosisQuestions'
import { SUPPORT_TYPES } from '../constants/supportTypes'
import { AnswerButtonGroup } from '../components/diagnosis/AnswerButtonGroup'
import { ChatBubble } from '../components/diagnosis/ChatBubble'
import { ProgressBar } from '../components/diagnosis/ProgressBar'
import { SupportTypeSelector } from '../components/diagnosis/SupportTypeSelector'
import { Button } from '../components/common/Button'

export function DiagnosisPage({
  answers,
  selectedTypes,
  onAnswer,
  onToggleType,
  onComplete,
  onBack,
}) {
  const logRef = useRef(null)
  const currentIndex = DIAGNOSIS_QUESTIONS.findIndex((question) => answers[question.id] === undefined)
  const isQuestionStep = currentIndex !== -1
  const currentQuestion = isQuestionStep ? DIAGNOSIS_QUESTIONS[currentIndex] : null
  const answeredQuestions = DIAGNOSIS_QUESTIONS.filter((question) => answers[question.id] !== undefined)
  const answeredCount = answeredQuestions.length
  const progressTotal = DIAGNOSIS_QUESTIONS.length + 1
  const progressCurrent = answeredCount + (!isQuestionStep && selectedTypes.length ? 1 : 0)

  useEffect(() => {
    if (!logRef.current) return
    logRef.current.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [answeredCount, isQuestionStep])

  return (
    <section className="flow-page">
      <div className="flow-card">
        <div className="flow-card__header">
          <Button variant="ghost" size="small" onClick={onBack}>
            처음으로
          </Button>
        </div>

        {isQuestionStep ? (
          <div className="diagnosis-step">
            <div className="conversation-log" ref={logRef}>
              {answeredQuestions.map((question, index) => (
                <div className="conversation-turn" key={question.id}>
                  <ChatBubble>
                    <span>질문 {index + 1}</span>
                    <strong>{question.text}</strong>
                  </ChatBubble>
                  <ChatBubble tone="user">
                    {answers[question.id] ? question.positiveLabel : question.negativeLabel}
                  </ChatBubble>
                </div>
              ))}
              <div className="conversation-turn">
                <ChatBubble>
                  <span>질문 {currentIndex + 1}</span>
                  <strong>{currentQuestion.text}</strong>
                </ChatBubble>
              </div>
            </div>
            <div className="conversation-actions">
              <AnswerButtonGroup
                positiveLabel={currentQuestion.positiveLabel}
                negativeLabel={currentQuestion.negativeLabel}
                onAnswer={(value) => onAnswer(currentQuestion.id, value)}
              />
            </div>
          </div>
        ) : (
          <div className="diagnosis-step">
            <div className="conversation-log" ref={logRef}>
              {answeredQuestions.map((question, index) => (
                <div className="conversation-turn" key={question.id}>
                  <ChatBubble>
                    <span>질문 {index + 1}</span>
                    <strong>{question.text}</strong>
                  </ChatBubble>
                  <ChatBubble tone="user">
                    {answers[question.id] ? question.positiveLabel : question.negativeLabel}
                  </ChatBubble>
                </div>
              ))}
              <div className="conversation-turn">
                <ChatBubble>
                  <strong>궁금하신 제도의 유형을 선택해주세요.</strong>
                  <p>복수 선택 가능 (최대 4가지)</p>
                </ChatBubble>
                <SupportTypeSelector selectedTypes={selectedTypes} onToggleType={onToggleType} />
              </div>
            </div>
            <div className="selected-summary">
              {selectedTypes.length ? (
                selectedTypes.map((typeId) => {
                  const type = SUPPORT_TYPES.find((item) => item.id === typeId)
                  return <span key={typeId}>{type?.shortLabel}</span>
                })
              ) : (
                <span>관심 유형을 하나 이상 선택해 주세요.</span>
              )}
            </div>
            <Button size="large" disabled={!selectedTypes.length} onClick={onComplete}>
              결과 확인하기
            </Button>
          </div>
        )}
        <ProgressBar current={progressCurrent} total={progressTotal} />
      </div>
    </section>
  )
}
