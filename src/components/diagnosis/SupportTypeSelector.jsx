import { SUPPORT_TYPES } from '../../constants/supportTypes'
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
