export function TextField({ label, helperText, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
      {helperText ? <small>{helperText}</small> : null}
    </label>
  )
}
