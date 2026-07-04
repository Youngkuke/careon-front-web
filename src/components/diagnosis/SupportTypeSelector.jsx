import { SUPPORT_TYPES } from '../../constants/supportTypes'

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
            <strong>{type.label}</strong>
            <span>{type.description}</span>
          </button>
        )
      })}
    </div>
  )
}
