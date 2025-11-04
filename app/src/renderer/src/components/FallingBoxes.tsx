import React, { memo, useEffect, useRef, useState } from 'react'
import log from 'electron-log'
import { Layer } from '../../../models/Layer'

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
  currentLayer: Layer
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
    willChange: 'transform'
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
  height = 760,
  currentLayer
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
  const trigValuesRef = useRef<string[]>([])
  const bindValuesRef = useRef<string[]>([])

  // render tick to drive React updates every frame
  const [, setRenderTick] = useState(0)

  useEffect(() => {
    onScoreRef.current = onScore
  }, [onScore])
  useEffect(() => {
    onLoseLifeRef.current = onLoseLife
  }, [onLoseLife])

  // Render every frame - requestAnimationFrame already matches display refresh rate (60Hz, 120Hz, etc.)
  // Only throttle parent callbacks to reduce parent re-renders
  const scoreCallbackThrottleRef = useRef<number>(0)

  /**
   * @todo Add gravity effect to boxes
   * @todo Add visual effects on box catch/miss
   * @todo Adjust spawn rate and box speed based on difficulty level
   * @todo replace any hard-coded widths/heights references to use width/height variables (spawn x and off-bottom threshold)
   */
  const BASE_SPAWN = 800

  useEffect(() => {
    const bindValues: string[] = []
    const trigValues: string[] = []
    currentLayer.remappings.forEach((bind, trigger) => {
      log.info('FallingBoxes: considering bind', bind, 'and trigger', trigger)
      /**
       * Every single key bind is a 'macro' that contains other binds.
       * Even if it is a simple key press, it is still wrapped in a macro bind.
       * @todo Verify this is intended behavior and not a bug.
       * For now, unwrap the bind if it is a macro with a single simple key bind inside.
       * @todo Right now, this only supports 'TapKey' binds.
       */
      if ('binds' in bind && Array.isArray(bind.binds) && bind.binds.length > 0) {
        if (bind.binds.length === 1) {
          const innerBind = bind.binds[0]
          log.info('FallingBoxes: unwrapped bind to inner bind', innerBind)
          if (
            'value' in innerBind &&
            typeof innerBind.value === 'string' &&
            'value' in trigger &&
            typeof trigger.value === 'string'
          ) {
            bindValues.push(innerBind.value.toLowerCase())
            trigValues.push(trigger.value.toLowerCase())
          }
        }
      }
    })
    bindValuesRef.current = bindValues
    trigValuesRef.current = trigValues
  }, [currentLayer])

  useEffect(() => {
    const localSpawnInterval = Math.max(150, BASE_SPAWN - (difficulty - 1) * 60)

    const spawnBox = (): void => {
      const id = nextId.current++
      const triggers = trigValuesRef.current
      const binds = bindValuesRef.current

      // This is a fallback in case there are no binds available
      if (!binds || binds.length === 0) {
        const letters = ['n', 'o', 'b', 'i', 'n', 'd', 's']
        const correct = letters[Math.floor(Math.random() * letters.length)]
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
        return
      }

      const idx = Math.floor(Math.random() * binds.length)
      const correct = triggers[idx]
      const display = binds[idx] ?? correct

      const box: Box = {
        id,
        text: display.toUpperCase(),
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
          if (onLoseLifeRef.current) onLoseLifeRef.current(livesRef.current)

          if (livesRef.current === 0) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            rafRef.current = null
            lastTimeRef.current = null
            return
          }
        }
      }

      // Update React render every frame - requestAnimationFrame already matches display refresh rate
      setRenderTick((r) => (r + 1) | 0)
      setScoreUI(scoreRef.current)
      setLivesUI(livesRef.current)

      // Throttle parent callbacks to reduce parent re-renders (10fps is sufficient for score/lives)
      scoreCallbackThrottleRef.current += dt
      if (scoreCallbackThrottleRef.current >= 100) {
        if (onScoreRef.current) onScoreRef.current(scoreRef.current)
        if (onLoseLifeRef.current) onLoseLifeRef.current(livesRef.current)
        scoreCallbackThrottleRef.current = scoreCallbackThrottleRef.current % 100
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    if (running && !paused) rafRef.current = requestAnimationFrame(loop)

    return (): void => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTimeRef.current = null
      scoreCallbackThrottleRef.current = 0
    }
  }, [running, paused, difficulty, height, width])

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

  // Use ref directly to avoid creating new array on every render
  // React will handle reconciliation based on keys
  const boxesForRender = boxesRef.current

  return (
    <div style={{ width, height, position: 'relative', background: '#000', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 8, left: 8, color: '#fff' }}>
        Score {scoreRef.current}
      </div>
      <div style={{ position: 'absolute', top: 8, right: 8, color: '#fff' }}>
        Lives {livesRef.current}
      </div>
      <div style={{ position: 'absolute', top: 36, left: 8 }}>
        <button onClick={() => setPaused((p) => !p)}>{paused ? 'Resume' : 'Pause'}</button>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '100%', willChange: 'contents' }}>
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
