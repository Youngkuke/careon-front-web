import { useState } from 'react'
import { Button } from '../common/Button'
import { Modal } from '../common/Modal'
import {
  classifyRequiredForm,
  getDocumentGuide,
  getRequiredFormGuide,
  isDisplayableRequiredForm,
} from '../../data/documentGuides'

export function ProgramDetailPanel({ program, saved, user, onBack, onSave }) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)

  if (!program) return null

  const rows = [
    ['지원 기간', program.period],
    ['신청 방법', program.method],
    ['신청 기간', program.deadline],
    ['결과 발표일', program.resultTime],
    ['문의처', program.contact || program.agency],
  ]
  const requiredDocuments = program.requiredDocuments || []
  const requiredForms = (program.requiredForms || []).filter((form) => isDisplayableRequiredForm(form.name))
  const selectedDocumentGuide = selectedDocument
    ? selectedDocument.kind === 'required_form'
      ? getRequiredFormGuide(selectedDocument)
      : getDocumentGuide(selectedDocument)
    : null

  const handleSaveClick = () => {
    if (saved) {
      setShowCancelConfirm(true)
      return
    }

    onSave(program.id)
  }

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false)
    onSave(program.id)
  }

  return (
    <div className="detail-panel-wrapper">
      <article className={`detail-panel ${selectedDocumentGuide ? 'has-document-guide' : ''}`}>
        <div className="detail-panel__topbar">
          <Button variant="ghost" size="small" onClick={onBack}>
            ← 목록으로
          </Button>
          <a className="detail-official-link detail-official-link--top" href={program.url} target="_blank" rel="noreferrer">
            공식 사이트 &gt;
          </a>
        </div>
        <header className="detail-panel__title">
          <h1>{program.title}</h1>
          <p>{program.agency}</p>
        </header>
        <p className="detail-panel__summary">{program.summary}</p>
        <dl className="detail-list">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {requiredDocuments.length ? (
          <section className="detail-section">
            <h2>필요 서류</h2>
            <div className="detail-document-list">
              {requiredDocuments.map((document, index) => (
                <button
                  className="detail-document-card"
                  type="button"
                  key={`${document.name}-${index}`}
                  aria-haspopup="dialog"
                  onClick={() => setSelectedDocument({
                    kind: 'required_document',
                    name: document.name,
                    url: document.url,
                    urlType: document.urlType,
                  })}
                >
                  <strong>{document.name}</strong>
                  <span>준비 방법 보기</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}
        {requiredForms.length ? (
          <section className="detail-section">
            <h2>신청 양식·관련 자료</h2>
            <div className="detail-document-list">
              {requiredForms.map((form, index) => (
                <button
                  className="detail-document-card"
                  type="button"
                  key={`${form.name}-${index}`}
                  aria-haspopup="dialog"
                  onClick={() => setSelectedDocument({
                    kind: 'required_form',
                    name: form.name,
                    url: form.url,
                    formType: classifyRequiredForm(form.name),
                  })}
                >
                  <strong>{form.name}</strong>
                  <span>파일 안내 보기</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}
        <div className="detail-panel__actions">
          <Button className={`detail-save-button ${saved ? 'is-saved' : ''}`} disabled={!user} onClick={handleSaveClick}>
            {saved ? '마감일 알림 받는 중' : '마감일 알림 받기'}
          </Button>
          {!user ? <span className="detail-login-note">로그인 후 마감일 알림을 받을 수 있어요.</span> : null}
        </div>
        <Modal
          open={showCancelConfirm}
          title="마감일 알림을 끌까요?"
          primaryLabel="계속 받을게요"
          secondaryLabel="알림 끄기"
          className="save-cancel-modal"
          onPrimary={() => setShowCancelConfirm(false)}
          onSecondary={handleConfirmCancel}
        >
          <p>
            <strong>{program.title}</strong>의 알림이 저장 목록에서 사라져요.
          </p>
          <p>필요해지면 언제든 다시 저장해서 마감일 알림을 받을 수 있어요.</p>
        </Modal>
      </article>
      {selectedDocumentGuide ? (
        <div className="document-guide-backdrop" role="presentation" onClick={() => setSelectedDocument(null)}>
          <section
            className="document-guide-dialog"
            role="dialog"
            aria-labelledby="document-guide-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="document-guide-dialog__header">
              <span>{selectedDocument.kind === 'required_form' ? selectedDocumentGuide.label : '서류 준비 안내'}</span>
              <h2 id="document-guide-title">{selectedDocumentGuide.displayName}</h2>
            </div>
            <p>{selectedDocumentGuide.description}</p>
            <ol>
              {selectedDocumentGuide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div className="document-guide-dialog__actions">
              {selectedDocumentGuide.actionUrl ? (
                <a href={selectedDocumentGuide.actionUrl} target="_blank" rel="noreferrer">
                  {selectedDocumentGuide.actionLabel || '공식 링크 열기'}
                </a>
              ) : null}
              <Button variant="secondary" size="small" onClick={() => setSelectedDocument(null)}>
                닫기
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
