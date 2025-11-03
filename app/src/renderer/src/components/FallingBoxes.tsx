import React, { memo, useEffect, useRef, useState } from 'react'
import log from 'electron-log'
import { Layer } from '../../../models/Layer'
import { background_music } from './audio_controller'
import lose_life_sound_file from '../assets/game_sounds/lose_life.mp3'

const lose_life_sound = new Audio(lose_life_sound_file)

type Box = {
  id: number
  text: string
  x: number
  y: number
  vy: number
  correctKey: string
  width: number
  height: number
  exploding: boolean
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
  exploding: boolean
}
const BoxView = memo(function BoxView({
  x,
  y,
  width,
  height,
  text,
  exploding
}: BoxViewProps & { exploding?: boolean }) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    transform: `translate3d(${x}px, ${y}px, 0)`,
    width,
    height,
    color: '#000',
    background: exploding ? '#ff0' : '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    fontWeight: 'bold',
    willChange: 'transform, opacity',
    animation: exploding ? 'explode 0.3s ease-out' : undefined
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
   */
  const BASE_SPAWN = 800

  useEffect(() => {
    const bindValues: string[] = []
    const trigValues: string[] = []
    currentLayer.remappings.forEach((bind, trigger) => {
      log.info('FallingBoxes: considering bind', bind, 'and trigger', trigger)
      /**
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
          height: 40,
          exploding: false
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
        height: 40,
        exploding: false
      }
      boxesRef.current.push(box)
    }

    log.info('FallingBoxes: starting main loop with spawn interval', localSpawnInterval)
    if (livesRef.current > 0 && running) {
      background_music.currentTime = 0
      background_music.play().catch((err) => log.warn('Background music play failed', err))
    }

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

          if (livesRef.current === 0) {
            background_music.pause()
            background_music.currentTime = 0
          }

          // notify parent immediately so game can end or act on life loss
          if (onLoseLifeRef.current) onLoseLifeRef.current(livesRef.current)
          if (livesRef.current === 0) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            rafRef.current = null
            lastTimeRef.current = null
            return
          }

          lose_life_sound.currentTime = 0
          lose_life_sound.play().catch((err) => log.warn('Sound play failed', err))
        }
      }

      // throttled UI updates: notify parent and trigger a React render at capped rate
      renderAccumulatorRef.current += dt
      if (renderAccumulatorRef.current >= RENDER_INTERVAL) {
        setRenderTick((r) => (r + 1) | 0)
        if (onScoreRef.current) onScoreRef.current(scoreRef.current)
        if (onLoseLifeRef.current) onLoseLifeRef.current(livesRef.current)
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
  }, [running, paused, difficulty, height, width, RENDER_INTERVAL])

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
        const box = boxes[bestIndex]
        box.exploding = true

        // Delay removal to allow animation
        setTimeout(() => {
          const index = boxes.findIndex((b) => b.id === box.id)
          if (index >= 0) boxes.splice(index, 1)
        }, 300) // adjust duration to match animation

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
            exploding={b.exploding}
          />
        ))}
      </div>
    </div>
  )
}

export default FallingBoxes
