import { motion, useReducedMotion } from 'motion/react'

export default function ChagokBlocks({ done, total }) {
  const reduce = useReducedMotion()
  const count = Math.max(0, total)

  return (
    <span className="blk" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => {
        const filled = index < done
        return (
          <motion.span
            key={`${index}-${filled ? 'on' : 'off'}`}
            className={filled ? 'cube on' : 'cube'}
            aria-hidden="true"
            initial={reduce || !filled ? false : { y: -10, opacity: 0.35 }}
            animate={{ y: 0, opacity: 1 }}
            transition={reduce ? { duration: 0 } : { type: 'spring', duration: 0.4, bounce: 0.12 }}
          />
        )
      })}
    </span>
  )
}
