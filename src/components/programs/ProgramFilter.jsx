import { SUPPORT_TYPES } from '../../constants/supportTypes'

const STATUS_OPTIONS = ['전체', '모집중', '상시', '마감']

export function ProgramFilter({ query, selectedType, status, onQueryChange, onTypeChange, onStatusChange }) {
  return (
    <section className="program-filter" aria-label="제도 검색과 필터">
      <label className="search-field">
        <span>검색</span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="예) 의료비 지원"
        />
      </label>
      <div className="filter-groups">
        <div className="filter-group">
          <span>유형</span>
          <div className="segmented" aria-label="지원 유형">
            <button className={selectedType === 'all' ? 'is-active' : ''} type="button" onClick={() => onTypeChange('all')}>
              전체
            </button>
            {SUPPORT_TYPES.map((type) => (
              <button
                key={type.id}
                className={selectedType === type.id ? 'is-active' : ''}
                type="button"
                onClick={() => onTypeChange(type.id)}
              >
                {type.shortLabel}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <span>모집 상태</span>
          <div className="segmented segmented--status" aria-label="모집 상태">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                className={status === option ? 'is-active' : ''}
                type="button"
                onClick={() => onStatusChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
