import React, { useEffect, useRef, useState } from 'react'

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

function FallingBoxesGame(): JSX.Element {
  const [running, setRunning] = useState(true)
  const [renderTick, setRenderTick] = useState(0) // increments to trigger React renders at capped rate
  const boxesRef = useRef<Box[]>([])
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const spawnAccumulator = useRef<number>(0)
  const nextId = useRef<number>(1)
  const scoreRef = useRef<number>(0)
  const [, setScoreUI] = useState(0)

  // config
  const SPAWN_INTERVAL = 800 // ms between spawns on average
  const MAX_DT = 100 // clamp dt to avoid huge jumps
  const RENDER_FPS = 30
  const RENDER_INTERVAL = 1000 / RENDER_FPS

  useEffect(() => {
    const loop = (t: number) => {
      if (lastTimeRef.current == null) lastTimeRef.current = t
      let dt = t - lastTimeRef.current
      if (dt > MAX_DT) dt = MAX_DT
      lastTimeRef.current = t

      // spawn logic (accumulate time, spawn when we exceed interval)
      spawnAccumulator.current += dt
      while (spawnAccumulator.current >= SPAWN_INTERVAL) {
        spawnAccumulator.current -= SPAWN_INTERVAL
        spawnBox()
      }

      // update boxes positions
      const boxes = boxesRef.current
      const seconds = dt / 1000
      for (let i = boxes.length - 1; i >= 0; i--) {
        const b = boxes[i]
        b.y += b.vy * seconds
        // optional gravity
        b.vy += 300 * seconds
        // remove if off bottom
        if (b.y > 820) boxes.splice(i, 1)
      }

      // periodically trigger React render for visuals
      // accumulate time in rafRef tick
      if (!rafRef.current) rafRef.current = 0
      rafRef.current = requestAnimationFrame(loop)
      // trigger render at capped rate
      setRenderTick((r) => (r + 1) % 100000)
      // update score UI occasionally
      setScoreUI(scoreRef.current)
    }

    if (running) {
      rafRef.current = requestAnimationFrame(loop)
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTimeRef.current = null
    }
  }, [running])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      // find hittable boxes that match key; choose one rule: closest to bottom
      const boxes = boxesRef.current
      let bestIndex = -1
      let bestDistance = Infinity
      for (let i = 0; i < boxes.length; i++) {
        const b = boxes[i]
        if (b.correctKey === key) {
          // example hit window: any y less than bottom threshold or use distance to target line
          const distance = Math.abs(700 - b.y) // prefer box near y=700
          if (distance < bestDistance) {
            bestDistance = distance
            bestIndex = i
          }
        }
      }
      if (bestIndex >= 0) {
        // remove box and increment score
        boxes.splice(bestIndex, 1)
        scoreRef.current += 100
        setScoreUI(scoreRef.current)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function spawnBox() {
    const id = nextId.current++
    const texts = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']
    const correct = texts[Math.floor(Math.random() * texts.length)]
    const box: Box = {
      id,
      text: correct.toUpperCase(),
      x: Math.random() * 800, // adjust to game width
      y: -40,
      vy: 80 + Math.random() * 80,
      correctKey: correct,
      width: 60,
      height: 40
    }
    boxesRef.current.push(box)
  }

  // snapshot for rendering
  const boxesForRender = boxesRef.current.slice()

  return (
    <div style={{ width: 800, height: 760, position: 'relative', background: '#000' }}>
      <div style={{ position: 'absolute', top: 8, left: 8, color: '#fff' }}>Score {scoreRef.current}</div>
      <div style={{ position: 'absolute', top: 36, left: 8 }}>
        <button onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Resume'}</button>
      </div>

      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {boxesForRender.map((b) => (
          <div
            key={b.id}
            style={{
              position: 'absolute',
              left: b.x,
              top: b.y,
              width: b.width,
              height: b.height,
              color: '#000',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
              fontWeight: 'bold'
            }}
          >
            {b.text}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FallingBoxesGame
