import { Button } from './Button'

export function Modal({
  open,
  title,
  children,
  primaryLabel,
  secondaryLabel,
  tertiaryLabel,
  onPrimary,
  onSecondary,
  onTertiary,
  className = '',
}) {
  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation">
      <section className={`modal ${className}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">{title}</h2>
        <div className="modal__body">{children}</div>
        <div className={`modal__actions ${tertiaryLabel ? 'modal__actions--stacked' : ''}`}>
          <div className="modal__button-row">
            {secondaryLabel ? (
              <Button variant="ghost" onClick={onSecondary}>
                {secondaryLabel}
              </Button>
            ) : null}
            <Button onClick={onPrimary}>{primaryLabel}</Button>
          </div>
          {tertiaryLabel ? (
            <button className="text-button modal__text-action" type="button" onClick={onTertiary}>
              {tertiaryLabel}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  )
}
