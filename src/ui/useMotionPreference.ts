import { useCallback, useEffect, useState } from 'react'

export type JimboMotionSetting = 'auto' | 'full' | 'reduced'

const ATTR = 'data-j-motion'
const STORAGE_KEY = 'jimbo-motion'
const MEDIA_QUERY = '(prefers-reduced-motion: reduce)'

function applyAttr(setting: JimboMotionSetting) {
  const root = document.documentElement
  if (setting === 'auto') {
    root.removeAttribute(ATTR)
  } else {
    root.setAttribute(ATTR, setting)
  }
}

function readStoredSetting(): JimboMotionSetting {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'full' || stored === 'reduced') return stored
  } catch {
    // localStorage unavailable (e.g. sandboxed MCP iframe) — fall through to auto.
  }
  return 'auto'
}

/**
 * A real, user-settable motion preference — not a silent one-way OS override.
 *
 * `setting` starts as `'auto'` (follows the OS prefers-reduced-motion signal, same
 * as before) but a user's explicit `'full'` or `'reduced'` choice always wins over
 * the OS, in both directions: someone can ask for full tactile motion even with the
 * OS set to reduce, or ask for reduced motion even when the OS says nothing. The
 * choice persists across visits via localStorage.
 *
 * Writes the `data-j-motion` attribute on <html>, which jimbo-tokens.css and
 * jimbo.css both key off — see the motion-setting block in jimbo-tokens.css.
 */
export function useMotionPreference() {
  const [setting, setSettingState] = useState<JimboMotionSetting>(() =>
    typeof document === 'undefined' ? 'auto' : readStoredSetting()
  )
  const [osPrefersReduced, setOsPrefersReduced] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(MEDIA_QUERY).matches
  )

  useEffect(() => {
    applyAttr(setting)
  }, [setting])

  useEffect(() => {
    const mql = window.matchMedia(MEDIA_QUERY)
    const onChange = () => setOsPrefersReduced(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const setSetting = useCallback((next: JimboMotionSetting) => {
    setSettingState(next)
    try {
      if (next === 'auto') window.localStorage.removeItem(STORAGE_KEY)
      else window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Best-effort persistence only — the in-memory setting still applies this session.
    }
  }, [])

  // What's actually in effect right now, resolving 'auto' against the OS signal —
  // for components (useDOMMagneticTilt, useSway) that gate JS-driven motion
  // directly rather than through the CSS custom properties.
  const effectiveReducedMotion =
    setting === 'reduced' ? true : setting === 'full' ? false : osPrefersReduced

  return { setting, setSetting, osPrefersReduced, effectiveReducedMotion }
}
