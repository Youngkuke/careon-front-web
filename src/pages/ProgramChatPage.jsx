import { useState } from 'react'
import { SideChatPanel } from '../components/layout/SideChatPanel'
import { Button } from '../components/common/Button'
import { api } from '../lib/api'

export function ProgramChatPage({ user, selectedTypes, onBack }) {
  const [chatState, setChatState] = useState(null)
  const [stateMessage, setStateMessage] = useState('')
  const [stateError, setStateError] = useState('')

  const handleLoadChatState = async () => {
    setStateError('')
    setStateMessage('')

    try {
      const state = await api.getChatState()
      setChatState(state)
      setStateMessage('진행 상태를 불러왔어요.')
    } catch (error) {
      setChatState(null)
      setStateError(error.message)
    }
  }

  const handleResetChatState = async () => {
    setStateError('')
    setStateMessage('')

    try {
      await api.resetChatState()
      setChatState(null)
      setStateMessage('챗봇 진행 상태를 초기화했어요.')
    } catch (error) {
      setStateError(error.message)
    }
  }

  return (
    <section className="program-chat-page">
      <div className="chat-state-panel">
        <div>
          <strong>챗봇 진행 상태</strong>
          <p>
            {chatState
              ? `${chatState.phaseLabel || '상태값 없음'} · 원시 단계 ${chatState.currentPhase ?? '-'} · 활성 제도 ${chatState.activePolicyId || '-'}`
              : '저장된 진행 상태를 확인할 수 있어요.'}
          </p>
        </div>
        <div className="item-actions">
          <Button type="button" variant="secondary" size="small" onClick={handleLoadChatState}>상태 조회</Button>
          <Button type="button" variant="danger" size="small" onClick={handleResetChatState}>초기화</Button>
        </div>
        {stateMessage ? <p className="form-success">{stateMessage}</p> : null}
        {stateError ? <p className="form-error">{stateError}</p> : null}
      </div>
      <SideChatPanel
        className="side-chat--full"
        userName={user?.name}
        selectedTypes={selectedTypes}
        onBack={onBack}
      />
    </section>
  )
}
