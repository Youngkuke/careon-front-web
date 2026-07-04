export function Button({
  children,
  variant = 'primary',
  size = 'medium',
  className = '',
  ...props
}) {
  return (
    <button className={`button button--${variant} button--${size} ${className}`} type="button" {...props}>
      {children}
    </button>
  )
}
