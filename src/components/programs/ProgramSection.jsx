import { SUPPORT_TYPE_MAP } from '../../constants/supportTypes'
import { ProgramCard } from './ProgramCard'

export function ProgramSection({ typeId, programs, savedProgramIds = [], onOpenProgram, onSaveProgram }) {
  const type = SUPPORT_TYPE_MAP[typeId]

  if (!programs.length) return null

  return (
    <section className="program-section">
      <div className="section-heading">
        <div>
          <h2>{type?.label} {programs.length}개</h2>
        </div>
      </div>
      <div className="program-list">
        {programs.map((program) => (
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
  )
}
