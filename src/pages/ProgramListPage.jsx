import { useEffect, useMemo, useState } from 'react'
import { SUPPORT_TYPES } from '../constants/supportTypes'
import { ProgramCard } from '../components/programs/ProgramCard'
import { ProgramSection } from '../components/programs/ProgramSection'
import { ProgramFilter } from '../components/programs/ProgramFilter'
import { Button } from '../components/common/Button'
import { api, normalizePolicy } from '../lib/api'
import chatbotImg from '../assets/chatbot.webp'
import noneSaveImg from '../assets/nonesave.webp'

const SUPPORT_TYPE_ORDER = SUPPORT_TYPES.map((type) => type.id)
const typeToApiId = (typeId) => SUPPORT_TYPES.find((type) => type.id === typeId)?.apiId

export function ProgramListPage({
  programs,
  selectedTypes,
  savedProgramIds,
  user,
  error,
  onOpenChat,
  onOpenProgram,
  onSaveProgram,
}) {
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [status, setStatus] = useState('전체')
  const [explorePrograms, setExplorePrograms] = useState([])
  const [exploreLoading, setExploreLoading] = useState(false)
  const [exploreError, setExploreError] = useState('')
  const [lookupIds, setLookupIds] = useState('')
  const [lookupPrograms, setLookupPrograms] = useState([])
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const orderedTypes = selectedTypes.length ? selectedTypes : SUPPORT_TYPE_ORDER
  const orderedPrograms = useMemo(() => (
    [...programs].sort((a, b) => SUPPORT_TYPE_ORDER.indexOf(a.type) - SUPPORT_TYPE_ORDER.indexOf(b.type))
  ), [programs])
  const savedPrograms = programs.filter((program) => savedProgramIds.includes(program.id))
  const filteredExplorePrograms = explorePrograms.filter((program) => (
    status === '전체' || program.status === status
  ))

  useEffect(() => {
    let ignore = false

    const loadPolicies = async () => {
      setExploreLoading(true)
      setExploreError('')

      try {
        const policyTypeIds = selectedType === 'all' ? undefined : [typeToApiId(selectedType)].filter(Boolean)
        const data = await api.getPolicies({
          category: 'YOUNG_CARER',
          policyTypeIds,
          keyword: query.trim() || undefined,
        })

        if (!ignore) {
          setExplorePrograms(data.map(normalizePolicy))
        }
      } catch (requestError) {
        if (!ignore) {
          setExplorePrograms([])
          setExploreError(requestError.message)
        }
      } finally {
        if (!ignore) {
          setExploreLoading(false)
        }
      }
    }

    loadPolicies()

    return () => {
      ignore = true
    }
  }, [query, selectedType])

  const handleLookupPolicies = async () => {
    const policyIds = lookupIds
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isSafeInteger(value))

    if (!policyIds.length) {
      setLookupError('조회할 제도 ID를 쉼표로 입력해 주세요.')
      setLookupPrograms([])
      return
    }

    setLookupLoading(true)
    setLookupError('')

    try {
      const data = await api.getPoliciesByIds(policyIds)
      setLookupPrograms(data.map(normalizePolicy))
    } catch (requestError) {
      setLookupPrograms([])
      setLookupError(requestError.message)
    } finally {
      setLookupLoading(false)
    }
  }

  return (
    <section className="programs-page programs-page--recommendation">
      <div className="programs-main">
        <div className="page-heading">
          <h1>{user ? `${user.name}님의 맞춤 제도` : '맞춤 제도'}</h1>
          {error ? <p className="form-error">{error}</p> : null}
        </div>

        <section className={`selected-programs ${savedPrograms.length ? 'has-items' : 'is-empty'}`}>
          <button className="selected-programs__chat-button" type="button" onClick={onOpenChat} aria-label="상담 채팅 열기">
            <span className="selected-programs__chat-avatar">
              <img src={chatbotImg} alt="" aria-hidden="true" />
            </span>
          </button>
          <div className="selected-programs__header">
            <span>내가 선택한 제도{savedPrograms.length ? ` ${savedPrograms.length}개` : ''}</span>
          </div>
          {savedPrograms.length ? (
            <div className="program-list program-list--compact">
              {savedPrograms.map((program) => (
                <ProgramCard key={program.id} program={program} saved onOpen={onOpenProgram} onSave={onSaveProgram} />
              ))}
            </div>
          ) : (
            <div className="selected-programs__empty">
              <img src={noneSaveImg} alt="" aria-hidden="true" />
              <strong>
                원하시는 제도를 선택해 저장하세요<br />
                앱에서 확인할 수 있어요
              </strong>
            </div>
          )}
        </section>

        <div className="program-sections">
          {orderedTypes.map((typeId) => (
            <ProgramSection
              key={typeId}
              typeId={typeId}
              programs={orderedPrograms.filter((program) => program.type === typeId)}
              savedProgramIds={savedProgramIds}
              onOpenProgram={onOpenProgram}
              onSaveProgram={onSaveProgram}
            />
          ))}
        </div>

        <section className="program-explorer">
          <div className="section-heading">
            <span>제도 관리</span>
            <h2>전체 제도 탐색</h2>
          </div>
          <ProgramFilter
            query={query}
            selectedType={selectedType}
            status={status}
            onQueryChange={setQuery}
            onTypeChange={setSelectedType}
            onStatusChange={setStatus}
          />
          {exploreLoading ? <p className="empty-state">제도를 불러오고 있어요.</p> : null}
          {exploreError ? <p className="form-error">{exploreError}</p> : null}
          {!exploreLoading && !exploreError ? (
            <div className="program-list">
              {filteredExplorePrograms.length ? filteredExplorePrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  saved={savedProgramIds.includes(program.id)}
                  onOpen={onOpenProgram}
                  onSave={onSaveProgram}
                />
              )) : <p className="empty-state">조건에 맞는 제도가 없어요.</p>}
            </div>
          ) : null}
        </section>

        <section className="program-explorer">
          <div className="section-heading">
            <span>AI 매칭 카드</span>
            <h2>ID 기반 제도 카드 조회</h2>
          </div>
          <div className="inline-form">
            <label className="search-field">
              <span>제도 ID</span>
              <input
                value={lookupIds}
                onChange={(event) => setLookupIds(event.target.value)}
                placeholder="예) 2,7,16"
              />
            </label>
            <Button type="button" onClick={handleLookupPolicies} disabled={lookupLoading}>
              {lookupLoading ? '조회 중...' : '조회'}
            </Button>
          </div>
          {lookupError ? <p className="form-error">{lookupError}</p> : null}
          {lookupPrograms.length ? (
            <div className="program-list">
              {lookupPrograms.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  saved={savedProgramIds.includes(program.id)}
                  onOpen={onOpenProgram}
                  onSave={onSaveProgram}
                />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </section>
  )
}
