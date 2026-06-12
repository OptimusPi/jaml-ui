'use client'

import React from 'react'
import { JimboSprite } from './sprites.js'
import { JOKERS } from '../sprites/spriteData.js'
import type { SpriteSheetType } from '../sprites/spriteMapper.js'

export interface JimboCookLeverSprite {
  name: string
  sheet?: SpriteSheetType
}

export interface JimboCookLeverProps {
  /** Search in flight — lever stays down, reels spin. */
  cooking: boolean
  /** Fired when an armed pull is released. */
  onCook: () => void
  /** Fired when the knob is tapped while cooking. */
  onStop?: () => void
  /**
   * Must-clause sprites. When provided while cooking, the reels slam onto
   * them left→right and stay locked until the next pull.
   */
  matchSprites?: JimboCookLeverSprite[]
  disabled?: boolean
  className?: string
}

// Mirrors --j-cook-travel in jimbo-addons.css.
const TRAVEL = 56
const ARM_FRACTION = 0.7
const REEL_COUNT = 3
const SPIN_TICK_MS = 90
const SLAM_STAGGER_MS = 80
const TAP_SLOP_PX = 6

function randomJoker(): JimboCookLeverSprite {
  return { name: JOKERS[Math.floor(Math.random() * JOKERS.length)].name, sheet: 'Jokers' }
}

/**
 * Slot-machine lever search trigger. Grab the gold knob and pull it down —
 * past ~70% of travel it arms; release fires `onCook` and the lever stays
 * slammed while `cooking`. Releasing early springs it back and nothing
 * fires (friction is the point). Tapping the knob mid-cook calls `onStop`.
 *
 * Engine-agnostic: the host wires its search hook into
 * `cooking` / `onCook` / `onStop` / `matchSprites`.
 */
export function JimboCookLever({
  cooking,
  onCook,
  onStop,
  matchSprites,
  disabled = false,
  className = '',
}: JimboCookLeverProps) {
  const [dragY, setDragY] = React.useState<number | null>(null)
  const [pulled, setPulled] = React.useState(false)
  const [reels, setReels] = React.useState<JimboCookLeverSprite[]>(
    () => Array.from({ length: REEL_COUNT }, randomJoker),
  )
  const [lockedCount, setLockedCount] = React.useState(0)
  const startYRef = React.useRef(0)
  const movedRef = React.useRef(false)
  const wasCookingRef = React.useRef(false)
  const matchRef = React.useRef(matchSprites)

  // `pulled` bridges the gap between releasing an armed pull and the host
  // flipping `cooking` true — so the knob stays down with no flicker.
  const down = cooking || pulled
  const slamming = cooking && (matchSprites?.length ?? 0) > 0
  const spinning = cooking && !slamming

  // Synced via effect (declared before the slam effect, which reads it) so
  // the slam fires once per search even if the array identity churns.
  React.useEffect(() => {
    matchRef.current = matchSprites
  }, [matchSprites])

  React.useEffect(() => {
    if (wasCookingRef.current && !cooking) setPulled(false)
    if (!wasCookingRef.current && cooking) setLockedCount(0)
    wasCookingRef.current = cooking
  }, [cooking])

  React.useEffect(() => {
    if (!spinning) return
    const id = window.setInterval(() => {
      setReels((prev) => prev.map(() => randomJoker()))
    }, SPIN_TICK_MS)
    return () => window.clearInterval(id)
  }, [spinning])

  React.useEffect(() => {
    if (!slamming) return
    const targets = matchRef.current ?? []
    if (targets.length === 0) return
    const ids = Array.from({ length: REEL_COUNT }, (_, i) =>
      window.setTimeout(() => {
        setReels((prev) => prev.map((r, j) => (j === i ? targets[i % targets.length] : r)))
        setLockedCount(i + 1)
      }, i * SLAM_STAGGER_MS),
    )
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [slamming])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    e.currentTarget.setPointerCapture(e.pointerId)
    startYRef.current = e.clientY
    movedRef.current = false
    if (!down) setDragY(0)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || dragY === null) return
    const raw = e.clientY - startYRef.current
    if (Math.abs(raw) > TAP_SLOP_PX) movedRef.current = true
    // Rubber-band: free travel to TRAVEL, then heavy damping past it.
    const y = raw <= 0 ? 0 : raw <= TRAVEL ? raw : TRAVEL + (raw - TRAVEL) * 0.25
    setDragY(y)
  }

  const handlePointerUp = () => {
    if (disabled) return
    if (down) {
      if (!movedRef.current) {
        onStop?.()
        setPulled(false)
      }
      return
    }
    if (dragY === null) return
    const armed = dragY >= TRAVEL * ARM_FRACTION
    setDragY(null)
    if (armed) {
      setPulled(true)
      navigator.vibrate?.(40)
      onCook()
    }
  }

  const handlePointerCancel = () => {
    setDragY(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    if (down) {
      onStop?.()
      setPulled(false)
    } else {
      setPulled(true)
      onCook()
    }
  }

  return (
    <div
      className={`j-cook-lever ${className}`.trim()}
      data-cooking={down || undefined}
      data-disabled={disabled || undefined}
    >
      <div className="j-cook-lever__reels">
        {reels.map((reel, i) => (
          <div
            key={i}
            className="j-cook-lever__reel"
            data-spinning={(spinning && i >= lockedCount) || undefined}
            data-locked={i < lockedCount || undefined}
          >
            <JimboSprite
              name={reel.name}
              sheet={reel.sheet}
              width={52}
              className="j-cook-lever__sprite"
            />
          </div>
        ))}
      </div>
      <div className="j-cook-lever__label">
        {down ? 'jimbo is cooking…' : 'let jimbo cook'}
      </div>
      <div className="j-cook-lever__track">
        <div
          className="j-cook-lever__knob"
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={down ? 'jimbo is cooking… tap to stop' : 'let jimbo cook'}
          data-dragging={dragY !== null || undefined}
          style={dragY !== null ? { transform: `translateY(${dragY}px)` } : undefined}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onKeyDown={handleKeyDown}
        >
          <div className="j-cook-lever__knob-face" />
        </div>
      </div>
    </div>
  )
}
