'use client'

import React, { useState, useEffect, useRef, memo } from 'react'
import { JimboColorOption, JIMBO_ANIMATIONS, type ButtonVariant } from './tokens.js'

// ─── Panel ───────────────────────────────────────────────────────────────────

export interface JimboPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  sway?: boolean
  onBack?: () => void
  backLabel?: string
  hideBack?: boolean
}

export const JimboPanel = memo(({
  children, className = '', sway = false, onBack, backLabel = 'Back', hideBack = false, style, ...props
}: JimboPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sway || !panelRef.current) return
    let frame: number
    const start = Date.now()
    const el = panelRef.current
    const tick = () => {
      const t = ((Date.now() - start) % JIMBO_ANIMATIONS.SWAY_DURATION) / JIMBO_ANIMATIONS.SWAY_DURATION * Math.PI * 2
      el.style.transform = `translate(${Math.sin(t) * JIMBO_ANIMATIONS.SWAY_AMOUNT * 0.3}px, ${Math.sin(t * 0.8) * JIMBO_ANIMATIONS.SWAY_AMOUNT}px)`
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); el.style.transform = '' }
  }, [sway])

  return (
    <div
      ref={panelRef}
      className={'rounded-xl p-4 flex flex-col items-stretch overflow-hidden ' + className}
      style={{
        backgroundColor: JimboColorOption.DARK_GREY,
        border: `3px solid ${JimboColorOption.BORDER_SILVER}`,
        boxShadow: `0 3px 0 0 ${JimboColorOption.BORDER_SOUTH}`,
        ...style,
      }}
      {...props}
    >
      <div className="flex-1 overflow-auto">{children}</div>
      {onBack && !hideBack && (
        <div className="mt-4 pt-2 shrink-0">
          <JimboBackButton onClick={onBack} label={backLabel} />
        </div>
      )}
    </div>
  )
})
JimboPanel.displayName = 'JimboPanel'

export interface JimboInnerPanelProps extends React.HTMLAttributes<HTMLDivElement> {}

export const JimboInnerPanel = memo(({ children, className = '', style, ...props }: JimboInnerPanelProps) => (
  <div
    className={'rounded-lg p-3 ' + className}
    style={{ backgroundColor: JimboColorOption.INNER_BORDER, border: `2px solid ${JimboColorOption.PANEL_EDGE}`, ...style }}
    {...props}
  >
    {children}
  </div>
))
JimboInnerPanel.displayName = 'JimboInnerPanel'

// ─── Button ──────────────────────────────────────────────────────────────────

const VARIANT_COLORS: Record<ButtonVariant, { bg: string; hover: string; text: string }> = {
  primary:   { bg: JimboColorOption.RED,    hover: JimboColorOption.DARK_RED,    text: '#fff' },
  secondary: { bg: JimboColorOption.BLUE,   hover: JimboColorOption.DARK_BLUE,   text: '#fff' },
  danger:    { bg: JimboColorOption.RED,    hover: JimboColorOption.DARK_RED,    text: '#fff' },
  back:      { bg: JimboColorOption.ORANGE, hover: JimboColorOption.DARK_ORANGE, text: '#fff' },
  ghost:     { bg: 'transparent', hover: 'rgba(255,255,255,0.1)', text: '#fff' },
}

export interface JimboButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'xs' | 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function JimboButton({
  children, variant = 'primary', size = 'md', fullWidth = false, className = '', style, disabled, ...props
}: JimboButtonProps) {
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const c = VARIANT_COLORS[variant]
  const pad = { xs: '0.2rem 0.5rem', sm: '0.25rem 0.75rem', md: '0.375rem 1rem', lg: '0.5rem 1.5rem' }[size]

  return (
    <button
      disabled={disabled}
      onMouseEnter={() => { if (!disabled) setHovered(true) }}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => { if (!disabled) setPressed(true) }}
      onMouseUp={() => setPressed(false)}
      className={className}
      style={{
        fontFamily: 'm6x11plus, monospace',
        backgroundColor: hovered ? c.hover : c.bg,
        color: c.text,
        padding: pad,
        borderRadius: '0.5rem',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : undefined,
        opacity: disabled ? 0.5 : 1,
        transform: pressed ? 'translateY(3px)' : 'none',
        boxShadow: pressed ? 'none' : '0 3px 0 0 rgba(0,0,0,0.5)',
        textShadow: '1px 1px 0 rgba(0,0,0,0.8)',
        userSelect: 'none',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export function JimboBackButton({
  label = 'Back', ...props
}: Omit<JimboButtonProps, 'variant' | 'children'> & { label?: string }) {
  return <JimboButton variant="back" size="sm" fullWidth {...props}>{label}</JimboButton>
}

// ─── Modal ───────────────────────────────────────────────────────────────────

export interface JimboModalProps {
  children: React.ReactNode
  open: boolean
  onClose: () => void
  title?: string
  className?: string
}

export function JimboModal({ children, open, onClose, title, className }: JimboModalProps) {
  const [visible, setVisible] = useState(open)
  const [opacity, setOpacity] = useState(open ? 1 : 0)

  useEffect(() => {
    if (open) {
      setVisible(true)
      requestAnimationFrame(() => setOpacity(1))
    } else {
      setOpacity(0)
      const t = setTimeout(() => setVisible(false), JIMBO_ANIMATIONS.MENU_SINK_DURATION)
      return () => clearTimeout(t)
    }
  }, [open])

  if (!visible) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.7)', opacity, transition: `opacity ${JIMBO_ANIMATIONS.MENU_SINK_DURATION}ms ease` }}
      onClick={onClose}
    >
      <JimboPanel
        sway
        onBack={onClose}
        backLabel="Close"
        className={'w-full flex flex-col max-h-[90vh] ' + (className ?? 'max-w-lg')}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {title && <h2 style={{ fontFamily: 'm6x11plus, monospace', color: '#fff', textAlign: 'center', margin: '0 0 1rem', fontSize: '1.25rem' }}>{title}</h2>}
        {children}
      </JimboPanel>
    </div>
  )
}
