export default function ChagokBlocks({ done, total }) {
  const count = Math.max(0, total)
  return (
    <span className="blk" role="img" aria-label={`${count}단계 중 ${done}단계 끝`}>
      {Array.from({ length: count }, (_, index) => (
        <i key={index} className={index < done ? 'on' : ''} aria-hidden="true" />
      ))}
    </span>
  )
}
