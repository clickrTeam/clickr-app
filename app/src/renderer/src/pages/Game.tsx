// import { useEffect, useRef, useState } from 'react'
// import { useLocation, useNavigate } from 'react-router-dom'
// import { Profile } from '../../../models/Profile'
// import { Button } from '@renderer/components/ui/button'

// type GameState = {
//   profile: Profile
//   layer_index: number
//   difficulty: number
// }

// function Game(): JSX.Element {
//   const location = useLocation()
//   const navigate = useNavigate()
//   const navbarHidden = location.pathname.startsWith('/training/game')

//   useEffect(() => {
//     if (!navbarHidden) return
//     void document.body.offsetHeight
//     window.dispatchEvent(new Event('resize'))
//   }, [navbarHidden])

//   const { profile, layer_index, difficulty } = (location.state as GameState) ?? {
//     profile: undefined,
//     layer_index: 0,
//     difficulty: 3
//   }

//   const currentLayer = profile?.layers?.[layer_index]

//   const [countdown, setCountdown] = useState<number>(3)
//   const [mode, setMode] = useState<'countingDown' | 'playing'>('countingDown')
//   const [score, setScore] = useState<number>(0)
//   const [highScore, setHighScore] = useState<number>(0)

//   const rafRef = useRef<number | null>(null)
//   const lastTimeRef = useRef<number | null>(null)

//   useEffect(() => {
//     // start countdown immediately
//     const interval = setInterval(() => {
//       setCountdown((c) => {
//         if (c <= 1) {
//           clearInterval(interval)
//           setMode('playing')
//           return 0
//         }
//         return c - 1
//       })
//     }, 1000)

//     return (): void => clearInterval(interval)
//   }, [])

//   useEffect(() => {
//     if (mode !== 'playing') {
//       if (rafRef.current) {
//         cancelAnimationFrame(rafRef.current)
//         rafRef.current = null
//       }
//       lastTimeRef.current = null
//       return
//     }

//     const loop = (t: number): void => {
//       if (lastTimeRef.current == null) lastTimeRef.current = t
//       const dt = t - lastTimeRef.current
//       lastTimeRef.current = t

//       // placeholder scoring influenced by difficulty
//       setScore((s) => s + Math.round((dt / 1000) * difficulty * 10))

//       rafRef.current = requestAnimationFrame(loop)
//     }

//     rafRef.current = requestAnimationFrame(loop)

//     return (): void => {
//       if (rafRef.current) {
//         cancelAnimationFrame(rafRef.current)
//         rafRef.current = null
//       }
//       lastTimeRef.current = null
//     }
//   }, [mode, difficulty])

//   useEffect(() => {
//     if (mode === 'playing') return
//     if (score > highScore) setHighScore(score)
//   }, [highScore, mode, score])

//   useEffect((): void => {
//     const locState = location.state as { highScore?: number } | undefined
//     if (locState?.highScore !== undefined) {
//       setHighScore(locState.highScore)
//     }
//   }, [])

//   useEffect((): void => {
//     if (score > highScore) setHighScore(score)
//   }, [score, highScore])

//   const handleStop = (): void => {
//     const finalHigh = Math.max(highScore, score)
//     setHighScore(finalHigh)
//     navigate('/training', { state: { profile, layer_index, highScore: finalHigh } })
//   }

//   const rootClass = `relative h-full w-full flex flex-col items-start px-8 ${navbarHidden ? '-mt-16' : 'pt-4'}`

//   return (
//     <div className={rootClass}>
//       <div className="fixed top-2 left-4 z-50">
//         <Button variant="outline" onClick={(): void => navigate(-1)}>
//           Back
//         </Button>
//       </div>

//       <header className="w-full max-w-6xl flex items-center justify-between mb-4">
//         <div>
//           <h2 className="text-xl font-semibold text-gray-700">Profile: {profile?.profile_name}</h2>
//           <div className="text-sm text-gray-500">
//             Layer: {currentLayer?.layer_name ?? `Layer ${layer_index}`}
//           </div>
//         </div>

//         <div className="text-right">
//           <div className="text-sm text-gray-500">High Score</div>
//           <div className="text-2xl font-bold text-cyan-600">{highScore}</div>
//         </div>
//       </header>

//       <main className="w-full max-w-6xl">
//         <div className="w-full bg-black rounded-lg text-white overflow-hidden flex flex-col items-center">
//           {/* Countdown / Playing area */}
//           {mode === 'countingDown' && (
//             <div className="w-full h-[720px] flex items-center justify-center">
//               <div className="text-8xl font-bold">{countdown > 0 ? countdown : 'Go!'}</div>
//             </div>
//           )}

//           {mode === 'playing' && (
//             <div className="w-full h-[720px] flex flex-col items-center justify-center">
//               <div className="mb-4 text-lg">Game running</div>
//               <div className="text-6xl font-bold">{score}</div>
//               <div className="mt-6">
//                 <Button variant="destructive" onClick={handleStop}>
//                   Stop and Return
//                 </Button>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   )
// }

// export default Game
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Profile } from '../../../models/Profile'
import { Button } from '@renderer/components/ui/button'

type GameState = {
  profile: Profile
  layer_index: number
  difficulty: number
}

function Game(): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()

  // hide navbar on /training/game routes; used to pull the game up
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

  const currentLayer = profile?.layers?.[layer_index]

  const [countdown, setCountdown] = useState<number>(3)
  const [mode, setMode] = useState<'countingDown' | 'playing'>('countingDown')
  const [score, setScore] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(0)

  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)

  useEffect(() => {
    // start countdown immediately
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

    return (): void => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (mode !== 'playing') {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      lastTimeRef.current = null
      return
    }

    const loop = (t: number): void => {
      if (lastTimeRef.current == null) lastTimeRef.current = t
      const dt = t - lastTimeRef.current
      lastTimeRef.current = t

      // placeholder scoring influenced by difficulty
      setScore((s) => s + Math.round((dt / 1000) * difficulty * 10))

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return (): void => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      lastTimeRef.current = null
    }
  }, [mode, difficulty])

  useEffect(() => {
    if (mode === 'playing') return
    if (score > highScore) setHighScore(score)
  }, [highScore, mode, score])

  useEffect((): void => {
    const locState = location.state as { highScore?: number } | undefined
    if (locState?.highScore !== undefined) {
      setHighScore(locState.highScore)
    }
  }, [])

  useEffect((): void => {
    if (score > highScore) setHighScore(score)
  }, [score, highScore])

  const handleStop = (): void => {
    const finalHigh = Math.max(highScore, score)
    setHighScore(finalHigh)
    navigate('/training', { state: { profile, layer_index, highScore: finalHigh } })
  }

  const rootClass = `relative h-full w-full flex flex-col items-start px-8 ${navbarHidden ? '-mt-16' : 'pt-4'}`

  return (
    <div className={rootClass}>
      {/* Top-left fixed control: always Stop and Return */}
      <div className="fixed top-2 left-4 z-50">
        <Button variant="destructive" onClick={handleStop}>
          Stop and Return
        </Button>
      </div>

      {/* Centered profile / layer at very top */}
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

      {/* Optional high score on the right top */}
      <div className="fixed top-2 right-4 z-40 pointer-events-none">
        <div className="pointer-events-auto text-right">
          <div className="text-sm text-gray-500">High Score</div>
          <div className="text-2xl font-bold text-cyan-600">{highScore}</div>
        </div>
      </div>

      {/* Game surface, removed in-game top button */}
      <main className="w-full max-w-6xl mt-20">
        <div className="w-full bg-black rounded-lg text-white overflow-hidden flex flex-col items-center">
          {/* Countdown / Playing area */}
          {mode === 'countingDown' && (
            <div className="w-full h-[720px] flex items-center justify-center">
              <div className="text-8xl font-bold">{countdown > 0 ? countdown : 'Go!'}</div>
            </div>
          )}

          {mode === 'playing' && (
            <div className="w-full h-[720px] flex flex-col items-center justify-center">
              <div className="mb-4 text-lg">Game running</div>
              <div className="text-6xl font-bold">{score}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Game
