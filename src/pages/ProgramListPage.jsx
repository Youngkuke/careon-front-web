import { useMemo, useState } from 'react'
import { SUPPORT_TYPES } from '../constants/supportTypes'
import { Button } from '../components/common/Button'
import { ProgramFilter } from '../components/programs/ProgramFilter'
import { ProgramCard } from '../components/programs/ProgramCard'
import { ProgramSection } from '../components/programs/ProgramSection'
import { SideChatPanel } from '../components/layout/SideChatPanel'

export function ProgramListPage({
  programs,
  selectedTypes,
  savedProgramIds,
  user,
  showSideChat,
  onOpenProgram,
}) {
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [status, setStatus] = useState('전체')
  const [showFilter, setShowFilter] = useState(false)

  const filteredPrograms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return programs.filter((program) => {
      const matchesQuery = !normalizedQuery
        || [program.title, program.agency, program.summary].some((value) => value.toLowerCase().includes(normalizedQuery))
      const matchesType = selectedType === 'all' || program.type === selectedType
      const matchesStatus = status === '전체' || program.status === status

      return matchesQuery && matchesType && matchesStatus
    })
  }, [programs, query, selectedType, status])

  const orderedTypes = selectedTypes.length ? selectedTypes : SUPPORT_TYPES.map((type) => type.id)
  const savedPrograms = programs.filter((program) => savedProgramIds.includes(program.id))
  const resetFilter = () => {
    setQuery('')
    setSelectedType('all')
    setStatus('전체')
    setShowFilter(false)
  }

  return (
    <section className="programs-page">
      <div className="programs-main">
        <div className="page-heading">
          <h1>{user ? `${user.name}님의 맞춤 제도` : '맞춤 제도'}</h1>
        </div>

        <section className={`selected-programs ${savedPrograms.length ? 'has-items' : 'is-empty'}`}>
          <div className="selected-programs__header">
            <span>내가 선택한 제도{savedPrograms.length ? ` ${savedPrograms.length}개` : ''}</span>
            {savedPrograms.length ? (
              <Button variant="secondary" size="small" onClick={() => setShowFilter(true)}>
                검색과 필터
              </Button>
            ) : null}
          </div>
          {savedPrograms.length ? (
            <div className="program-list program-list--compact">
              {savedPrograms.map((program) => (
                <ProgramCard key={program.id} program={program} onOpen={onOpenProgram} />
              ))}
            </div>
          ) : (
            <div className="selected-programs__empty">
              <span aria-hidden="true" />
              <strong>
                원하시는 제도를 선택해 저장하세요<br />
                앱에서 확인할 수 있어요
              </strong>
              <Button variant="secondary" size="small" onClick={() => setShowFilter(true)}>
                검색과 필터
              </Button>
            </div>
          )}
        </section>

        {showFilter ? (
          <section className="filter-panel">
            <div className="filter-panel__header">
              <h2>검색과 필터</h2>
              <Button variant="secondary" size="small" onClick={resetFilter}>
                초기 화면
              </Button>
            </div>
            <ProgramFilter
              query={query}
              selectedType={selectedType}
              status={status}
              onQueryChange={setQuery}
              onTypeChange={setSelectedType}
              onStatusChange={setStatus}
            />
            <div className="filter-panel__result">
              <span>검색 결과: {filteredPrograms.length}개</span>
              <div className="program-list">
                {filteredPrograms.map((program) => (
                  <ProgramCard key={program.id} program={program} onOpen={onOpenProgram} />
                ))}
              </div>
              {!filteredPrograms.length ? <p className="empty-state">조건에 맞는 제도를 찾지 못했어요.</p> : null}
            </div>
          </section>
        ) : (
          <div className="program-sections">
            {orderedTypes.map((typeId) => (
              <ProgramSection
                key={typeId}
                typeId={typeId}
                programs={filteredPrograms.filter((program) => program.type === typeId)}
                onOpenProgram={onOpenProgram}
              />
            ))}
            {!filteredPrograms.length ? <p className="empty-state">조건에 맞는 제도를 찾지 못했어요.</p> : null}
          </div>
        )}
      </div>
      <div className={`side-chat-slot ${showSideChat ? '' : 'is-hidden'}`} aria-hidden={!showSideChat}>
        <SideChatPanel userName={user?.name} selectedTypes={selectedTypes} />
      </div>
    </section>
  )
}
