import React, { memo, useEffect, useRef, useState } from 'react'
import log from 'electron-log'
import { Layer } from '../../../models/Layer'
import { background_music } from './audio_controller'
import lose_life_sound_file from '../assets/game_sounds/lose_life.mp3'
import correct_sound_file from '../assets/game_sounds/correct_sound2.mp3'

const lose_life_sound = new Audio(lose_life_sound_file)
const correct_sound = new Audio(correct_sound_file)
lose_life_sound.volume = 0.3 // Reduce volume to 30% (range: 0.0 to 1.0)
correct_sound.volume = 0.3

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
  onStreakChange: (streak: number) => void
  initialHighScore: number
  initialLives: number
  width: number
  height: number
  currentLayer: Layer
  muteSound: boolean
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
const BoxView = memo(function BoxView({ x, y, width, height, text, exploding }: BoxViewProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    transform: `translate3d(${x}px, ${y}px, 0)`,
    width,
    height,
    color: '#000',
    background: exploding ? 'rgba(40, 206, 40, 1)' : '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    fontWeight: 'bold',
    willChange: 'transform, opacity',
    animation: exploding ? 'explode 0.3s ease-out' : undefined
  }

  return (
    <div
      style={style}
      // Set custom CSS variables directly on the DOM element
      ref={(el) => {
        if (el) {
          el.style.setProperty('--x', `${x}px`)
          el.style.setProperty('--y', `${y}px`)
        }
      }}
    >
      {text}
    </div>
  )
})

function FallingBoxes({
  running = true,
  difficulty = 3,
  onScore,
  onLoseLife,
  onStreakChange,
  initialLives = 3,
  width = 800,
  height = 760,
  currentLayer,
  muteSound = false
}: FallingBoxesProps): JSX.Element {
  const [paused] = useState(false)

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
  const streakRef = useRef<number>(0)
  const [, setStreakUI] = useState<number>(0) // used to force renders when streak changes
  const STREAK_THRESHOLD = 10
  const BONUS_PER_HIT = 50 // adjust to your desired bonus per hit during a streak
  const onStreakChangeRef = useRef<((s: number) => void) | undefined>(undefined)

  // render tick to drive React updates every frame
  const [, setRenderTick] = useState(0)
  const [explodingBoxes, setExplodingBoxes] = useState<Box[]>([])

  useEffect(() => {
    onScoreRef.current = onScore
  }, [onScore])
  useEffect(() => {
    onLoseLifeRef.current = onLoseLife
  }, [onLoseLife])

  useEffect(() => {
    onStreakChangeRef.current = onStreakChange
  }, [onStreakChange])

  // Render every frame - requestAnimationFrame already matches display refresh rate (60Hz, 120Hz, etc.)
  // Only throttle parent callbacks to reduce parent re-renders
  const scoreCallbackThrottleRef = useRef<number>(0)
  const BASE_SPAWN = 800

  useEffect(() => {
    const bindValues: string[] = []
    const trigValues: string[] = []
    currentLayer.remappings.forEach((bind, trigger) => {
      log.info('FallingBoxes: considering bind', bind, 'and trigger', trigger)
      /**
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
    if (livesRef.current > 0 && running && !muteSound) {
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

          // reset streak on miss
          if (streakRef.current !== 0) {
            streakRef.current = 0
            setStreakUI(0)
            if (onStreakChangeRef.current) onStreakChangeRef.current(0)
          }

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
          if (!muteSound) {
            lose_life_sound.currentTime = 0
            lose_life_sound.play().catch((err) => log.warn('Sound play failed', err))
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
      streakRef.current = 0
      setStreakUI(0)
      if (onStreakChangeRef.current) onStreakChangeRef.current(0)
    }
  }, [running, paused, difficulty, height, width, muteSound])

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

        // Move to exploding layer
        setExplodingBoxes((prev) => [...prev, { ...box }])

        // Remove original box immediately
        boxes.splice(bestIndex, 1)

        if (!muteSound) {
          correct_sound.currentTime = 0
          correct_sound.play().catch((err) => log.warn('Correct sound play failed', err))
        }
        // Remove from exploding layer after animation
        setTimeout(() => {
          setExplodingBoxes((prev) => prev.filter((b) => b.id !== box.id))
        }, 300)

        // base points for a correct hit
        const basePoints = Math.round(100 * 0.5 * difficulty)

        // increment streak
        streakRef.current = (streakRef.current ?? 0) + 1
        setStreakUI(streakRef.current)
        if (onStreakChangeRef.current) onStreakChangeRef.current(streakRef.current)

        // determine bonus: only after reaching threshold apply bonus per hit (you could also apply for hits >= threshold)
        const bonus = streakRef.current >= STREAK_THRESHOLD ? BONUS_PER_HIT : 0

        scoreRef.current += basePoints + bonus
        setScoreUI(scoreRef.current)
        if (onScoreRef.current) onScoreRef.current(scoreRef.current)
      }
    }
    window.addEventListener('keydown', onKey)
    return (): void => {
      window.removeEventListener('keydown', onKey)
    }
  }, [difficulty, height, muteSound, onScore])

  const boxesForRender = boxesRef.current.slice()

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        // frosted glass effect
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'absolute', top: 8, left: 8, color: '#fff' }}>
        Score {scoreRef.current}
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
            exploding={b.exploding}
          />
        ))}
        {explodingBoxes.map((b) => (
          <BoxView
            key={`explode-${b.id}`}
            id={b.id}
            x={b.x}
            y={b.y}
            width={b.width}
            height={b.height}
            text={b.text}
            exploding={true}
          />
        ))}
      </div>
    </div>
  )
}
export default FallingBoxes
