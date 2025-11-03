import { useEffect, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Profile } from '../../../models/Profile'
import { Button } from '@renderer/components/ui/button'
import log from 'electron-log'
import FallingBoxes from '@renderer/components/FallingBoxes'
import game_over_sound_file from '../assets/game_sounds/game_over.mp3'
import { background_music } from '../components/audio_controller'

const game_over_sound = new Audio(game_over_sound_file)

type GameState = {
  profile: Profile
  layer_index: number
  difficulty: number
}

function Game(): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()

  // hide navbar on /training/game routes
  const navbarHidden = location.pathname.startsWith('/training/game')

  // force reflow / resize when navbarHidden changes so layout updates immediately
  useEffect(() => {
    if (!navbarHidden) return
    void document.body.offsetHeight
    window.dispatchEvent(new Event('resize'))
  }, [navbarHidden])

  const { profile, layer_index, difficulty } = (location.state as GameState) ?? {
    profile: undefined,
    layer_index: 0,
    difficulty: 3
  }

  const currentLayer = profile.layers[layer_index]

  const [countdown, setCountdown] = useState<number>(3)
  const [mode, setMode] = useState<'countingDown' | 'playing' | 'gameOver'>('countingDown')
  const [score, setScore] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(0)
  const [lives, setLives] = useState<number>(11 - difficulty)
  const [gameOver, setGameOver] = useState(false)
  const [startCount, setStartCount] = useState(0)

  const PLAY_AREA_HEIGHT = 680

  const handleBoxScore = useCallback(
    (s: number): void => {
      setScore(s)
      if (s > highScore) setHighScore(s)
    },
    [highScore]
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          setMode('playing')
          setStartCount((c) => c + 1)
          return 0
        }
        return c - 1
      })
    }, 1000)

    return (): void => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (mode === 'playing') return
    if (score > highScore) setHighScore(score)
  }, [highScore, mode, score])

  useEffect((): void => {
    const locState = location.state as { highScore?: number } | undefined
    if (locState?.highScore !== undefined) {
      setHighScore(locState.highScore)
    }
  }, [location.state])

  useEffect((): void => {
    if (score > highScore) setHighScore(score)
  }, [score, highScore])

  const handleStop = (): void => {
    background_music.pause()
    background_music.currentTime = 0
    const finalHigh = Math.max(highScore, score)
    setMode('gameOver')
    setHighScore(finalHigh)
    navigate('/training', { state: { profile, layer_index, highScore: finalHigh } })
  }

  const handleLoseLife = useCallback(
    (remaining: number): void => {
      setLives(remaining)
      if (remaining <= 0) {
        const finalHigh = Math.max(highScore, score)
        setHighScore(finalHigh)
        setGameOver(true)
        game_over_sound.currentTime = 0
        game_over_sound.play().catch((err) => log.warn('Sound play failed', err))
      }
    },
    [highScore, score]
  )

  const rootClass = `relative h-full w-full flex flex-col items-start px-8 ${navbarHidden ? '-mt-16' : 'pt-4'}`

  /**
   * @todo Resize play area to be more appropriate for smaller windows or screens
   */
  return (
    <div className={rootClass}>
      <div className="fixed top-2 left-4 z-50">
        <Button variant="destructive" onClick={handleStop}>
          Stop and Return
        </Button>
      </div>

      <div className="fixed top-2 inset-x-0 z-40 flex justify-center pointer-events-none">
        <div className="pointer-events-auto text-center bg-transparent">
          <div className="text-lg font-semibold text-gray-700">
            Profile: {profile?.profile_name}
          </div>
          <div className="text-sm text-gray-500">
            Layer: {currentLayer?.layer_name ?? `Layer ${layer_index}`}
          </div>
        </div>
      </div>

      <div className="fixed top-2 right-4 z-40 pointer-events-none">
        <div className="text-right">
          <div className="text-sm text-gray-500">High Score</div>
          <div className="text-2xl font-bold text-cyan-600">{highScore}</div>
          <div className="text-sm text-gray-500 mt-2">Lives</div>
          <div className="text-2xl font-bold text-red-500">{lives}</div>
        </div>
      </div>

      <main className="w-full max-w-6xl mt-20">
        <div className="w-full bg-black rounded-lg text-white overflow-hidden flex flex-col items-center">
          {/* Playing area */}
          {mode === 'countingDown' && (
            <div
              className="w-full flex items-center justify-center"
              style={{ height: PLAY_AREA_HEIGHT }}
            >
              <div className="text-8xl font-bold">{countdown > 0 ? countdown : 'Go!'}</div>
            </div>
          )}

          {mode === 'playing' && (
            <div
              className="w-full flex flex-col items-center justify-center"
              style={{ height: PLAY_AREA_HEIGHT }}
            >
              <FallingBoxes
                key={startCount}
                running={mode === 'playing' && !gameOver}
                difficulty={Number(difficulty)}
                onScore={handleBoxScore}
                onLoseLife={handleLoseLife}
                initialHighScore={highScore}
                initialLives={11 - difficulty}
                width={1000}
                height={PLAY_AREA_HEIGHT}
                currentLayer={currentLayer}
              />
            </div>
          )}
        </div>

        {gameOver && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-lg p-6 w-96 text-center">
              <div className="text-xl font-bold mb-4">Game Over</div>
              <div className="mb-6">Final score: {score}</div>
              <div className="flex justify-center">
                <Button
                  variant="destructive"
                  onClick={() => {
                    const finalHigh = Math.max(highScore, score)
                    setHighScore(finalHigh)
                    navigate('/training', { state: { profile, layer_index, highScore: finalHigh } })
                  }}
                >
                  Return
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Game
