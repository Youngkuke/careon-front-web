import { Button } from './Button'

export function Modal({ open, title, children, primaryLabel, secondaryLabel, onPrimary, onSecondary }) {
  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">{title}</h2>
        <div className="modal__body">{children}</div>
        <div className="modal__actions">
          {secondaryLabel ? (
            <Button variant="ghost" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          ) : null}
          <Button onClick={onPrimary}>{primaryLabel}</Button>
        </div>
      </section>
    </div>
  )
}
