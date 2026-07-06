import { useMemo, useState } from 'react'
import { SUPPORT_TYPES } from '../constants/supportTypes'
import { Button } from '../components/common/Button'
import { ProgramFilter } from '../components/programs/ProgramFilter'
import { ProgramCard } from '../components/programs/ProgramCard'
import { ProgramSection } from '../components/programs/ProgramSection'
import { SideChatPanel } from '../components/layout/SideChatPanel'

const SUPPORT_TYPE_ORDER = SUPPORT_TYPES.map((type) => type.id)
const RESULTS_PER_PAGE = 6

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
  const [resultPage, setResultPage] = useState(0)

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

  const orderedTypes = selectedTypes.length ? selectedTypes : SUPPORT_TYPE_ORDER
  const groupedFilteredPrograms = useMemo(() => (
    [...filteredPrograms].sort((a, b) => SUPPORT_TYPE_ORDER.indexOf(a.type) - SUPPORT_TYPE_ORDER.indexOf(b.type))
  ), [filteredPrograms])
  const totalResultPages = Math.max(1, Math.ceil(groupedFilteredPrograms.length / RESULTS_PER_PAGE))
  const boundedResultPage = Math.min(resultPage, totalResultPages - 1)
  const visibleFilteredPrograms = groupedFilteredPrograms.slice(
    boundedResultPage * RESULTS_PER_PAGE,
    boundedResultPage * RESULTS_PER_PAGE + RESULTS_PER_PAGE,
  )
  const savedPrograms = programs.filter((program) => savedProgramIds.includes(program.id))

  const resetFilter = () => {
    setQuery('')
    setSelectedType('all')
    setStatus('전체')
    setResultPage(0)
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
                <ProgramCard key={program.id} program={program} saved onOpen={onOpenProgram} />
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
              onQueryChange={(nextQuery) => {
                setQuery(nextQuery)
                setResultPage(0)
              }}
              onTypeChange={(nextType) => {
                setSelectedType(nextType)
                setResultPage(0)
              }}
              onStatusChange={(nextStatus) => {
                setStatus(nextStatus)
                setResultPage(0)
              }}
            />
            <div className="filter-panel__result">
              <div className="filter-panel__result-header">
                <span>검색 결과: {filteredPrograms.length}개</span>
                {filteredPrograms.length ? (
                  <span>{boundedResultPage + 1} / {totalResultPages}</span>
                ) : null}
              </div>
              <div className="program-list program-list--paged">
                {visibleFilteredPrograms.map((program) => (
                  <ProgramCard
                    key={program.id}
                    program={program}
                    saved={savedProgramIds.includes(program.id)}
                    onOpen={onOpenProgram}
                  />
                ))}
              </div>
              {!filteredPrograms.length ? <p className="empty-state">조건에 맞는 제도를 찾지 못했어요.</p> : null}
              <div className="filter-pagination">
                <Button
                  variant="secondary"
                  size="small"
                  disabled={boundedResultPage === 0}
                  onClick={() => setResultPage((page) => Math.max(0, page - 1))}
                >
                  이전
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  disabled={boundedResultPage >= totalResultPages - 1}
                  onClick={() => setResultPage((page) => Math.min(totalResultPages - 1, page + 1))}
                >
                  다음
                </Button>
              </div>
            </div>
          </section>
        ) : (
          <div className="program-sections">
            {orderedTypes.map((typeId) => (
              <ProgramSection
                key={typeId}
                typeId={typeId}
                programs={filteredPrograms.filter((program) => program.type === typeId)}
                savedProgramIds={savedProgramIds}
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
