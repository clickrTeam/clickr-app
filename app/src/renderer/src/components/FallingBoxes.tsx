import React, { memo, useEffect, useRef, useState } from 'react'
import log from 'electron-log'

type Box = {
  id: number
  text: string
  x: number
  y: number
  vy: number
  correctKey: string
  width: number
  height: number
}

type FallingBoxesProps = {
  running: boolean
  difficulty: number
  onScore: (score: number) => void
  onLoseLife: (remainingLives: number) => void
  initialHighScore: number
  initialLives: number
  width: number
  height: number
}

type BoxViewProps = {
  id: number
  x: number
  y: number
  width: number
  height: number
  text: string
}
const BoxView = memo(function BoxView({ x, y, width, height, text }: BoxViewProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    transform: `translate3d(${x}px, ${y}px, 0)`,
    width,
    height,
    color: '#000',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    fontWeight: 'bold',
    willChange: 'transform, opacity'
  }
  return <div style={style}>{text}</div>
})

function FallingBoxes({
  running = true,
  difficulty = 3,
  onScore,
  onLoseLife,
  initialLives = 3,
  width = 800,
  height = 760
}: FallingBoxesProps): JSX.Element {
  const [paused, setPaused] = useState(false)

  const boxesRef = useRef<Box[]>([])
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const spawnAccumulator = useRef<number>(0)
  const nextId = useRef<number>(1)
  const scoreRef = useRef<number>(0)
  const [, setScoreUI] = useState(0)
  const livesRef = useRef<number>(initialLives)
  const [, setLivesUI] = useState<number>(initialLives)
  const onScoreRef = useRef(onScore)
  const onLoseLifeRef = useRef(onLoseLife)

  // tiny render tick to drive React updates at throttled rate
  const [, setRenderTick] = useState(0)

  useEffect(() => {
    onScoreRef.current = onScore
  }, [onScore])
  useEffect(() => {
    onLoseLifeRef.current = onLoseLife
  }, [onLoseLife])
  const RENDER_FPS = 30
  const RENDER_INTERVAL = 1000 / RENDER_FPS
  const renderAccumulatorRef = useRef<number>(0)

  /**
   * @todo Add gravity effect to boxes
   * @todo Add visual effects on box catch/miss
   * @todo Adjust spawn rate and box speed based on difficulty level
   * @todo replace any hard-coded widths/heights references to use width/height variables (spawn x and off-bottom threshold)
   */
  const BASE_SPAWN = 800

  useEffect(() => {
    const localSpawnInterval = Math.max(150, BASE_SPAWN - (difficulty - 1) * 60)

    /**
     * @todo Refactor spawnBox to use the random bind values from layer.remapping.
     * Make sure that the binds are not complex like macros
     */
    const spawnBox = (): void => {
      const id = nextId.current++
      const texts = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']
      const correct = texts[Math.floor(Math.random() * texts.length)]
      const box: Box = {
        id,
        text: correct.toUpperCase(),
        x: Math.random() * Math.max(0, width - 60),
        y: -40,
        vy: 80 + Math.random() * 80,
        correctKey: correct,
        width: 60,
        height: 40
      }
      boxesRef.current.push(box)
    }

    log.info('FallingBoxes: starting main loop with spawn interval', localSpawnInterval)

    const loop = (t: number): void => {
      if (lastTimeRef.current == null) lastTimeRef.current = t
      let dt = t - lastTimeRef.current
      if (dt > 100) dt = 100
      lastTimeRef.current = t

      spawnAccumulator.current += dt
      while (spawnAccumulator.current >= localSpawnInterval) {
        spawnAccumulator.current -= localSpawnInterval
        spawnBox()
      }

      const boxes = boxesRef.current
      const seconds = dt / 1000
      for (let i = boxes.length - 1; i >= 0; i--) {
        const b = boxes[i]
        b.y += b.vy * seconds
        // gravity
        b.vy += 300 * seconds
        // remove if off bottom and deduct a life
        if (b.y > height + 40) {
          boxes.splice(i, 1)

          // decrement lives, update local UI and force a render tick immediately
          livesRef.current = Math.max(0, livesRef.current - 1)
          setLivesUI(livesRef.current)
          setRenderTick((r) => (r + 1) | 0)

          // notify parent immediately so game can end or act on life loss
          if (onLoseLife) onLoseLife(livesRef.current)

          if (livesRef.current === 0) {
            /**
             * stop the loop by cancelling the RAF
             * the cleanup below also cancels
             * @todo Can add additional clean up logic here if needed
             */
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            rafRef.current = null
            lastTimeRef.current = null
            return
          }
        }
      }

      // throttled UI updates: notify parent and trigger a React render at capped rate
      renderAccumulatorRef.current += dt
      if (renderAccumulatorRef.current >= RENDER_INTERVAL) {
        setRenderTick((r) => (r + 1) | 0)
        if (onScore) onScore(scoreRef.current)
        if (onLoseLife) onLoseLife(livesRef.current)
        // reset accumulator but keep remainder
        renderAccumulatorRef.current = renderAccumulatorRef.current % RENDER_INTERVAL
        setScoreUI(scoreRef.current)
        setLivesUI(livesRef.current)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    if (running && !paused) rafRef.current = requestAnimationFrame(loop)

    return (): void => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTimeRef.current = null
      renderAccumulatorRef.current = 0
    }
  }, [running, paused, difficulty, height, width, RENDER_INTERVAL, onLoseLife, onScore])

  useEffect(() => {
    livesRef.current = initialLives
    setLivesUI(initialLives)
  }, [initialLives])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const key = e.key.toLowerCase()
      const boxes = boxesRef.current
      let bestIndex = -1
      let bestDistance = Infinity
      for (let i = 0; i < boxes.length; i++) {
        const b = boxes[i]
        if (b.correctKey === key) {
          const distance = Math.abs(height - 60 - b.y)
          if (distance < bestDistance) {
            bestDistance = distance
            bestIndex = i
          }
        }
      }
      if (bestIndex >= 0) {
        // remove box and increment score
        boxes.splice(bestIndex, 1)
        scoreRef.current += Math.round(100 * 0.5 * difficulty)
        setScoreUI(scoreRef.current)
        if (onScore) onScore(scoreRef.current)
      }
    }
    window.addEventListener('keydown', onKey)
    return (): void => {
      window.removeEventListener('keydown', onKey)
    }
  }, [difficulty, height, onScore])

  const boxesForRender = boxesRef.current.slice()

  return (
    <div style={{ width, height, position: 'relative', background: '#000' }}>
      <div style={{ position: 'absolute', top: 8, left: 8, color: '#fff' }}>
        Score {scoreRef.current}
      </div>
      <div style={{ position: 'absolute', top: 8, right: 8, color: '#fff' }}>
        Lives {livesRef.current}
      </div>
      <div style={{ position: 'absolute', top: 36, left: 8 }}>
        <button onClick={() => setPaused((p) => !p)}>{paused ? 'Resume' : 'Pause'}</button>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {boxesForRender.map((b) => (
          <BoxView
            key={b.id}
            id={b.id}
            x={b.x}
            y={b.y}
            width={b.width}
            height={b.height}
            text={b.text}
          />
        ))}
      </div>
    </div>
  )
}

export default FallingBoxes
