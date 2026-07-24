import { useEffect, useRef, useState } from 'react'
import { SUPPORT_TYPE_MAP } from '../../constants/supportTypes'
import { Button } from '../common/Button'

function OverflowText({ as: Tag, className, children }) {
  const textRef = useRef(null)
  const [overflowDistance, setOverflowDistance] = useState(0)

  useEffect(() => {
    const element = textRef.current
    if (!element) return undefined

    const updateOverflow = () => {
      setOverflowDistance(Math.max(0, element.scrollWidth - element.clientWidth))
    }

    updateOverflow()
    const observer = new ResizeObserver(updateOverflow)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const isOverflowing = overflowDistance > 0

  return (
    <Tag
      ref={textRef}
      className={`${className} ${isOverflowing ? 'is-overflowing' : ''}`}
      title={isOverflowing ? children : undefined}
      style={isOverflowing ? { '--scroll-distance': `-${overflowDistance}px` } : undefined}
    >
      <span>{children}</span>
    </Tag>
  )
}

export function ProgramCard({ program, onOpen, saved = false }) {
  const type = SUPPORT_TYPE_MAP[program.type]

  return (
    <article className={`program-card ${saved ? 'is-saved' : ''}`}>
      <div className="program-card__meta">
        <span>{type?.shortLabel}</span>
      </div>
      <OverflowText as="h3" className="program-card__title">{program.title}</OverflowText>
      <OverflowText as="p" className="program-card__agency">{program.agency}</OverflowText>
      <OverflowText as="p" className="program-card__summary">{program.summary}</OverflowText>
      <div className="program-card__actions">
        <Button variant="secondary" size="small" onClick={() => onOpen(program.id)}>
          자세히 보기
        </Button>
      </div>
    </article>
  )
}
