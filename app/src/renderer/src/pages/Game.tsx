import { useEffect, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Profile } from '../../../models/Profile'
import { Button } from '@renderer/components/ui/button'
import log from 'electron-log'
import FallingBoxes from '@renderer/components/FallingBoxes'
import game_over_sound_file from '../assets/game_sounds/game_over.mp3'
import sky_background from '../assets/sky_background.jpg'
import { background_music } from '../components/audio_controller'

const game_over_sound = new Audio(game_over_sound_file)

type GameState = {
  profile: Profile
  layer_index: number
  difficulty: number
  muteSound: boolean
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

  const { profile, layer_index, difficulty, muteSound } = (location.state as GameState) ?? {
    profile: undefined,
    layer_index: 0,
    difficulty: 3,
    muteSound: false
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

  const rootStyle: React.CSSProperties = {
    backgroundImage: `url(${sky_background})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }

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
    navigate('/training', { state: { profile, layer_index, highScore: finalHigh, muteSound } })
  }

  const handleLoseLife = useCallback(
    (remaining: number): void => {
      setLives(remaining)
      if (remaining <= 0) {
        const finalHigh = Math.max(highScore, score)
        setHighScore(finalHigh)
        setGameOver(true)

        if (!muteSound) {
          game_over_sound.currentTime = 0
          game_over_sound.play().catch((err) => log.warn('Sound play failed', err))
        }
      }
    },
    [highScore, muteSound, score]
  )

  const rootClass = `relative h-full w-full flex flex-col items-start px-8 ${navbarHidden ? '-mt-16' : 'pt-4'}`

  return (
    <div
      className={rootClass}
      style={{
        ...rootStyle,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        margin: 0,
        padding: 0
      }}
    >
      <img
        src={sky_background}
        alt=""
        className="pointer-events-none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          opacity: 0.08,
          zIndex: -10
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: 'rgba(0,0,0,0.02)', zIndex: -5 }}
      />

      <div className="fixed top-2 left-4 z-50">
        <Button variant="destructive" onClick={handleStop}>
          Stop and Return
        </Button>
      </div>

      <div className="fixed top-2 inset-x-0 z-40 flex justify-center pointer-events-none">
        <div className="pointer-events-auto text-center bg-transparent">
          <div
            className="text-2xl font-semibold text-white"
            style={{
              textShadow:
                '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000'
            }}
          >
            Profile: {profile?.profile_name}
          </div>
          <div
            className="text-lg text-white"
            style={{
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
            }}
          >
            Layer: {currentLayer?.layer_name ?? `Layer ${layer_index}`}
          </div>
        </div>
      </div>

      <div className="fixed top-2 right-4 z-40 pointer-events-none">
        <div className="text-right">
          <div
            className="text-lg text-white"
            style={{
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
            }}
          >
            High Score
          </div>
          <div
            className="text-4xl font-bold text-white"
            style={{
              textShadow:
                '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000'
            }}
          >
            {highScore}
          </div>

          <div
            className="text-lg text-white mt-2"
            style={{
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
            }}
          >
            Lives
          </div>
          <div
            className={`text-3xl font-bold ${lives === 1 ? 'text-red-500' : 'text-white'}`}
            style={{
              textShadow:
                '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000'
            }}
          >
            {lives}
          </div>
        </div>
      </div>

      <main className="w-full max-w-6xl mt-20">
        <div className="w-full rounded-lg text-white overflow-hidden flex flex-col items-center bg-transparent">
          {mode === 'countingDown' && (
            <div
              className="flex items-center justify-center bg-transparent"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh'
              }}
            >
              <div
                className="text-8xl font-bold text-white"
                style={{
                  textShadow:
                    '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 0 6px rgba(0,0,0,0.6)'
                }}
              >
                {countdown > 0 ? countdown : 'Go!'}
              </div>
            </div>
          )}

          {mode === 'playing' && (
            <div
              className="flex items-center justify-center bg-transparent"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh'
              }}
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
                muteSound={muteSound}
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
                    navigate('/training', {
                      state: { profile, layer_index, highScore: finalHigh, muteSound }
                    })
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
