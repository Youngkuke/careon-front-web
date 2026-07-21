import { SUPPORT_TYPE_MAP } from '../../constants/supportTypes'
import { Button } from '../common/Button'

export function ProgramCard({ program, onOpen, onSave, saved = false }) {
  const type = SUPPORT_TYPE_MAP[program.type]

  return (
    <article className={`program-card ${saved ? 'is-saved' : ''}`}>
      <div className="program-card__meta">
        <span>{type?.shortLabel}</span>
        <span>{program.status}</span>
      </div>
      <h3>{program.title}</h3>
      <p className="program-card__agency">{program.agency}</p>
      <p>{program.summary}</p>
      <div className="program-card__actions">
        <Button variant="secondary" size="small" onClick={() => onOpen(program.id)}>
          자세히 보기
        </Button>
        {onSave ? (
          <Button variant={saved ? 'primary' : 'secondary'} size="small" onClick={() => onSave(program.id)}>
            {saved ? '저장됨' : '저장'}
          </Button>
        ) : null}
      </div>
    </article>
  )
}
