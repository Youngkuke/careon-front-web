import { SUPPORT_TYPE_MAP } from '../../constants/supportTypes'
import { ProgramCard } from './ProgramCard'
import brainIcon from '../../assets/brain.webp'
import careIcon from '../../assets/care.webp'
import homeIcon from '../../assets/home.webp'
import medicalIcon from '../../assets/medical.webp'

const SUPPORT_TYPE_ICONS = {
  living: homeIcon,
  care: careIcon,
  medical: medicalIcon,
  mental: brainIcon,
}

export function ProgramSection({ typeId, programs, savedProgramIds = [], onOpenProgram, onSaveProgram }) {
  const type = SUPPORT_TYPE_MAP[typeId]

  if (!programs.length) return null

  return (
    <section className="program-section">
      <div className="section-heading">
        <div>
          <h2>
            <img src={SUPPORT_TYPE_ICONS[typeId]} alt="" aria-hidden="true" />
            {type?.label} {programs.length}개
          </h2>
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
