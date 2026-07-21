export function TextField({ label, helperText, helperTone = 'default', ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
      {helperText ? <small className={`field__helper field__helper--${helperTone}`}>{helperText}</small> : null}
    </label>
  )
}
