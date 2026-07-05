import { SUPPORT_TYPES } from '../../constants/supportTypes'
import brainIcon from '../../assets/brain.svg'
import careIcon from '../../assets/care.svg'
import homeIcon from '../../assets/home.svg'
import medicalIcon from '../../assets/medical.svg'

const SUPPORT_TYPE_ICONS = {
  living: homeIcon,
  care: careIcon,
  medical: medicalIcon,
  mental: brainIcon,
}

export function SupportTypeSelector({ selectedTypes, onToggleType }) {
  return (
    <div className="support-type-list">
      {SUPPORT_TYPES.map((type) => {
        const selected = selectedTypes.includes(type.id)

        return (
          <button
            key={type.id}
            className={`support-type ${selected ? 'is-selected' : ''}`}
            type="button"
            onClick={() => onToggleType(type.id)}
            aria-pressed={selected}
          >
            <img src={SUPPORT_TYPE_ICONS[type.id]} alt="" aria-hidden="true" />
            <span>
              <strong>{type.label}</strong>
              <small>{type.description}</small>
            </span>
          </button>
        )
      })}
    </div>
  )
}
