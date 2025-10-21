import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Profile } from '../../../models/Profile'
import { Button } from '@renderer/components/ui/button'

function Training(): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()

  const { profile, layer_index } = location.state as {
    profile: Profile
    layer_index: number
    return_to: { pathname: string }
  }

  // UI state
  const [difficulty, setDifficulty] = useState<number>(3) // 1..10
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [typingText, setTypingText] = useState<string>('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const currentLayer = profile.layers[layer_index]

  const startGame = (): void => {
    // Example: toggle in-place play mode
    setIsPlaying(true)

    // Example: you may want to pass these into a Game component or route
    const remappings = currentLayer // read whatever you need from the layer
    const settings = { difficulty, remappings }

    // If you have a dedicated game route:
    // navigate('/training/game', { state: { profile, layer_index, difficulty } })

    // Autofocus or reset typing box when game starts
    if (textareaRef.current) {
      textareaRef.current.blur()
    }

    // TODO: actually start game loop using settings
    console.log('Starting training with settings', settings)
  }

  /**
   * Stops the current game session.
   * Cleans up any game state as necessary.
   */
  const stopGame = (): void => {
    setIsPlaying(false)
  }

  return (
    <div className="flex flex-col items-center justify-start h-full text-center p-8 gap-6">
      <h2 className="text-xl font-semibold text-gray-700">Profile: {profile.profile_name}</h2>
      <h2 className="text-xl font-semibold text-gray-700">
        Layer: {currentLayer.layer_name ?? `Layer ${layer_index}`}
      </h2>
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
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="w-full"
            aria-label="Training difficulty"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Easy</span>
            <span>Hard</span>
          </div>
        </div>

        {/* Start / Stop button */}
        <div className="flex justify-center gap-4 items-center mt-2">
          {!isPlaying ? (
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

          <Button
            size="lg"
            variant="outline"
            className="border-cyan-600 text-black hover:bg-cyan-700 px-6"
            onClick={() => navigate(-1)}
          >
            Home
          </Button>
        </div>

        {/* Free typing box */}
        <div className="flex flex-col gap-2">
          <label htmlFor="typing" className="text-sm font-medium text-gray-600">
            Try typing (free mode)
          </label>
          <textarea
            id="typing"
            ref={textareaRef}
            value={typingText}
            onChange={(e) => setTypingText(e.target.value)}
            placeholder={isPlaying ? 'Game running — typing disabled' : 'Type here to practice...'}
            disabled={isPlaying}
            className="w-full min-h-[120px] p-3 border rounded resize-vertical focus:outline-cyan-500"
          />
        </div>
      </div>
    </div>
  )
}

export default Training
