import { SUPPORT_TYPE_MAP } from '../../constants/supportTypes'
import { Button } from '../common/Button'

export function ProgramDetailPanel({ program, saved, user, onBack, onSave }) {
  if (!program) return null

  const rows = [
    ['지원 기간', program.period],
    ['비용 부담', program.cost],
    ['신청 마감일', program.deadline],
    ['신청 방법', program.method],
    ['결과까지 걸리는 기간', program.resultTime],
    ['서류 발급 방법', program.documentGuide],
    ['비고', program.note],
    ['중복 수혜 제한', program.duplicateRule],
  ]

  return (
    <article className="detail-panel">
      <Button variant="ghost" size="small" onClick={onBack}>
        ← 목록으로
      </Button>
      <div className="detail-panel__title">
        <span>{SUPPORT_TYPE_MAP[program.type]?.label}</span>
        <h1>{program.title}</h1>
        <p>{program.agency}</p>
      </div>
      <p className="detail-panel__summary">{program.summary}</p>
      <dl className="detail-list">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
        <div>
          <dt>필요 서류</dt>
          <dd>{program.documents.join(', ')}</dd>
        </div>
      </dl>
      <div className="detail-panel__actions">
        <Button disabled={!user} onClick={() => onSave(program.id)}>
          {saved ? '저장됨 · 앱 안내 보기' : '마감일 알림 받기'}
        </Button>
        {!user ? <span className="detail-login-note">로그인 후 마감일 알림을 받을 수 있어요.</span> : null}
        <a href={program.url} target="_blank" rel="noreferrer">
          공식 사이트 열기
        </a>
      </div>
    </article>
  )
}
