import { useRef, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Profile } from '../../../models/Profile'
import { Button } from '@renderer/components/ui/button'

type TrainingState = {
  profile: Profile
  layer_index: number
}

function Training(): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()

  const { profile, layer_index } = (location.state as TrainingState) ?? {
    profile: undefined,
    layer_index: 0
  }

  const currentLayer = profile?.layers?.[layer_index]

  // UI/game state
  const [difficulty, setDifficulty] = useState<number>(3) // 1..10
  const [mode, setMode] = useState<'idle' | 'countingDown' | 'playing'>('idle')
  const [countdown, setCountdown] = useState<number>(3)
  const [score, setScore] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(0)
  const [typingText, setTypingText] = useState<string>('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // refs for animation/game loop
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)

  // start countdown then game
  const startGame = (): void => {
    setScore(0)
    setCountdown(3)
    setMode('countingDown')
  }

  // stop game and return to idle (preserve high score)
  const stopGame = (): void => {
    setMode('idle')
    if (score > highScore) setHighScore(score)
    cancelRaf()
  }

  const cancelRaf = (): void => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  // countdown effect
  useEffect((): (() => void) | void => {
    if (mode !== 'countingDown') return
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          setMode('playing')
          return 0
        }
        return c - 1
      })
    }, 1000)

    return (): void => {
      clearInterval(interval)
    }
  }, [mode])

  // when entering play mode, start a simple game loop
  useEffect((): (() => void) | void => {
    if (mode !== 'playing') {
      cancelRaf()
      lastTimeRef.current = null
      return
    }

    // blur typing area if present
    if (textareaRef.current) textareaRef.current.blur()

    const loop = (t: number): void => {
      if (lastTimeRef.current == null) lastTimeRef.current = t
      const dt = t - lastTimeRef.current
      lastTimeRef.current = t

      // placeholder: score increases over time modified by difficulty
      setScore((s) => s + Math.round((dt / 1000) * difficulty * 10))

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return (): void => {
      cancelRaf()
      lastTimeRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, difficulty])

  // Always show back button in top-left; use a lambda so navigate(-1) is not executed immediately
  const backButton = (
    <div className="fixed top-4 left-4 z-50">
      <Button variant="outline" onClick={(): void => navigate(-1)}>
        Back
      </Button>
    </div>
  )

  return (
    <div className="relative h-full w-full flex flex-col items-center p-8">
      {backButton}

      <header className="w-full max-w-4xl flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-700">Profile: {profile?.profile_name}</h2>
          <div className="text-sm text-gray-500">
            Layer: {currentLayer?.layer_name ?? `Layer ${layer_index}`}
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-500">High Score</div>
          <div className="text-2xl font-bold text-cyan-600">{highScore}</div>
        </div>
      </header>

      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6 flex flex-col gap-4">
        {/* Difficulty slider */}
        <div className="flex flex-col gap-2">
          <label htmlFor="difficulty" className="text-sm font-medium text-gray-600">
            Difficulty: <span className="font-semibold">{difficulty}</span>
          </label>
          <input
            id="difficulty"
            type="range"
            min={1}
            max={10}
            value={difficulty}
            onChange={(e): void => setDifficulty(Number(e.target.value))}
            className="w-full"
            aria-label="Training difficulty"
            disabled={mode !== 'idle'}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Easy</span>
            <span>Hard</span>
          </div>
        </div>

        {/* Controls / Score */}
        <div className="flex items-center justify-center gap-4 mt-2">
          {mode !== 'playing' ? (
            <Button
              size="lg"
              variant="default"
              className="bg-cyan-600 text-white px-6"
              onClick={startGame}
            >
              Start Game
            </Button>
          ) : (
            <Button size="lg" variant="destructive" className="px-6" onClick={stopGame}>
              Stop Game
            </Button>
          )}

          <div className="ml-4 text-sm text-gray-600">
            <div>Score</div>
            <div className="text-xl font-semibold">{score}</div>
          </div>
        </div>

        {/* Game area */}
        <div className="relative w-full h-[360px] bg-black rounded overflow-hidden flex items-center justify-center">
          {/* When idle show typing box and instructions */}
          {mode === 'idle' && (
            <div className="w-full h-full p-6 flex flex-col gap-4">
              <div className="text-center text-gray-600">Free practice or press Start Game to play</div>
              <textarea
                id="typing"
                ref={textareaRef}
                value={typingText}
                onChange={(e): void => setTypingText(e.target.value)}
                placeholder="Type here to practice..."
                className="w-full h-full p-3 border rounded resize-none focus:outline-cyan-500"
              />
            </div>
          )}

          {/* Countdown overlay */}
          {mode === 'countingDown' && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70">
              <div className="text-white text-6xl font-bold">{countdown > 0 ? countdown : 'Go!'}</div>
            </div>
          )}

          {/* Playing overlay - placeholder visuals */}
          {mode === 'playing' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-white">
              <div className="mb-4 text-lg">Game running</div>
              <div className="text-4xl font-bold">{score}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Training
