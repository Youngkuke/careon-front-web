export function ProgressBar({ current, total }) {
  return (
    <div className="progress-dashes" aria-label={`자가진단 ${current}/${total} 완료`}>
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={index < current ? 'is-complete' : ''}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}
