import { useEffect, useRef } from 'react'
import { DIAGNOSIS_QUESTIONS } from '../constants/diagnosisQuestions'
import { AnswerButtonGroup } from '../components/diagnosis/AnswerButtonGroup'
import { ChatBubble } from '../components/diagnosis/ChatBubble'
import { ProgressBar } from '../components/diagnosis/ProgressBar'
import { Button } from '../components/common/Button'

export function DiagnosisPage({
  answers,
  onAnswer,
  onComplete,
  onBack,
}) {
  const logRef = useRef(null)
  const currentIndex = DIAGNOSIS_QUESTIONS.findIndex((question) => answers[question.id] === undefined)
  const isQuestionStep = currentIndex !== -1
  const currentQuestion = isQuestionStep ? DIAGNOSIS_QUESTIONS[currentIndex] : null
  const answeredQuestions = DIAGNOSIS_QUESTIONS.filter((question) => answers[question.id] !== undefined)
  const answeredCount = answeredQuestions.length
  const progressTotal = DIAGNOSIS_QUESTIONS.length
  const progressCurrent = answeredCount

  useEffect(() => {
    if (!logRef.current) return
    logRef.current.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [answeredCount, isQuestionStep])

  return (
    <section className="flow-page flow-page--diagnosis">
      <Button className="diagnosis-page__back" variant="secondary" size="small" onClick={onBack}>
        처음으로
      </Button>
      <div className="diagnosis-layout">
        <div className="flow-card">

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
                <div className="conversation-actions">
                  <AnswerButtonGroup
                    positiveLabel={currentQuestion.positiveLabel}
                    negativeLabel={currentQuestion.negativeLabel}
                    onAnswer={(value) => onAnswer(currentQuestion.id, value)}
                  />
                </div>
              </div>
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
                  <strong>답변을 바탕으로 필요한 제도를 찾아볼게요.</strong>
                </ChatBubble>
              </div>
            </div>
            <Button size="large" onClick={onComplete}>
              결과 확인하기
            </Button>
          </div>
        )}
        </div>
        <ProgressBar current={progressCurrent} total={progressTotal} />
      </div>
    </section>
  )
}
