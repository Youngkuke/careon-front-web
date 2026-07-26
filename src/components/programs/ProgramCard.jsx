import { Button } from '../common/Button'

export function ProgramCard({ program, onOpen, saved = false }) {
  return (
    <article className={`program-card ${saved ? 'is-saved' : ''}`}>
      <h3 className="program-card__title">{program.title}</h3>
      <p className="program-card__agency">{program.agency}</p>
      <p className="program-card__summary">{program.summary}</p>
      <div className="program-card__actions">
        <Button variant="secondary" size="small" onClick={() => onOpen(program.id)}>
          자세히 보기
        </Button>
      </div>
    </article>
  )
}
