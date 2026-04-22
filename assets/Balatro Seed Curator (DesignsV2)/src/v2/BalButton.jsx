// BalButton — the ONE button primitive for the whole app.
//
// Rules (from pifreak, final):
//  - 100% flat 2D fill. No gradients, no inset highlights, no rounded-on-rounded.
//  - Shadow: 3px south + 1px east (single solid shade, darker of same hue).
//  - Pressed: button translates onto its shadow; shadow disappears.
//  - Text: 1px east + 1px south drop-shadow at rgba(0,0,0,.8). Nothing else.
//  - Font: m6x11plus, uppercase, letter-spacing 2.
//
// Variants: color | shadow (auto-paired from JimboColor), size sm|md|lg,
//           fullWidth, twoThirds (the canonical Balatro Back-button width).

(function(){
  const { useState } = React;
  const C = window.JimboColor;

  // shadow pairs — one source of truth
  const PAIRS = {
    orange: [C.ORANGE, C.DARK_ORANGE],
    red:    [C.RED,    C.DARK_RED],
    blue:   [C.BLUE,   C.DARK_BLUE],
    green:  [C.GREEN,  C.DARK_GREEN],
    gold:   [C.GOLD,   '#8a6a1e'],
    grey:   [C.DARK_GREY, C.DARKEST],
  };

  function BalButton({
    tone = 'orange',
    color, shadow,          // optional override
    size = 'md',
    fullWidth = false,
    twoThirds = false,      // Back-button canonical width
    disabled = false,
    onClick,
    style,
    children,
  }) {
    const [pressed, setPressed] = useState(false);
    const [fg, sh] = color && shadow ? [color, shadow] : (PAIRS[tone] || PAIRS.orange);

    const pad = size === 'sm' ? '4px 10px' : size === 'lg' ? '14px 18px' : '9px 14px';
    const fs  = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;

    const width = fullWidth ? '100%' : twoThirds ? '66.666%' : 'auto';

    return (
      <div
        onMouseDown={() => !disabled && setPressed(true)}
        onMouseUp={()   => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        onTouchStart={() => !disabled && setPressed(true)}
        onTouchEnd={()   => setPressed(false)}
        onClick={() => !disabled && onClick && onClick()}
        style={{
          display: 'inline-block',
          width,
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          opacity: disabled ? 0.55 : 1,
          ...style,
        }}
      >
        {/* shadow layer — 3px south + 1px east, single flat fill, no border-radius fuss */}
        <div style={{
          position: 'absolute',
          left: 1,
          top: 3,
          right: -1,
          bottom: -3,
          background: sh,
          borderRadius: 6,
          opacity: pressed ? 0 : 1,
        }} />
        {/* button face */}
        <div style={{
          position: 'relative',
          background: fg,
          borderRadius: 6,
          padding: pad,
          transform: pressed ? 'translate(1px, 3px)' : 'translate(0,0)',
          transition: 'transform 55ms linear',
          textAlign: 'center',
          fontFamily: 'm6x11plus, monospace',
          fontSize: fs,
          letterSpacing: 2,
          color: C.WHITE,
          textShadow: '1px 1px 0 rgba(0,0,0,0.8)',
          textTransform: 'uppercase',
          lineHeight: 1.1,
        }}>{children}</div>
      </div>
    );
  }

  // Canonical Back button — always 2/3 width, always says "Back", always bottom-docked.
  function BackButton({ onClick }) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '8px 10px 10px' }}>
        <BalButton tone="orange" size="md" twoThirds onClick={onClick}>Back</BalButton>
      </div>
    );
  }

  window.BalButton = BalButton;
  window.BackButton = BackButton;
})();
