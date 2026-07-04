import { Button } from '../common/Button'

export function AnswerButtonGroup({ positiveLabel, negativeLabel, onAnswer }) {
  return (
    <div className="answer-group">
      <Button onClick={() => onAnswer(true)}>{positiveLabel}</Button>
      <Button variant="secondary" onClick={() => onAnswer(false)}>
        {negativeLabel}
      </Button>
    </div>
  )
}
