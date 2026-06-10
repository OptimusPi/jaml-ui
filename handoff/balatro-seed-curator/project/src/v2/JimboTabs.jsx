// JimboTabs — ported from jaml-ui/src/ui/jimboTabs.tsx
//
// Horizontal tabs: each tab is a red Balatro button with a bouncy red
// triangle hovering above the active one. Triangle bounces 3px on a
// custom cubic-bezier (0.68, 0, 0.68, 1) — the kind of bounce that hits
// hard on the way down and floats on the way up.
//
// Usage:
//   <JimboTabs tabs={[{id, label}, ...]} activeTab={id} onTabChange={fn} />

const { useState: jtUS } = React;
const Cjt = window.JimboColor;

const JIMBO_TABS_PRESS_Y = 2;
const JIMBO_TABS_PRESS_MS = 50;

(function injectJtKf(){
  if (document.getElementById('jt-kf')) return;
  const s = document.createElement('style');
  s.id = 'jt-kf';
  s.textContent = `
    @keyframes jimbo-bounce {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-3px); }
    }
  `;
  document.head.appendChild(s);
})();

function JimboTab({ label, active, onClick }) {
  const [pressed, setPressed] = jtUS(false);
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Bouncy red triangle — only visible on active tab */}
      <div
        style={{
          marginBottom: 4,
          opacity: active ? 1 : 0,
          transition: 'opacity 150ms',
          animation: active ? 'jimbo-bounce 0.8s cubic-bezier(0.68, 0, 0.68, 1) infinite' : 'none',
        }}
        aria-hidden="true"
      >
        <svg width="14" height="10" viewBox="0 0 14 10" fill={Cjt.RED}>
          <polygon points="7,10 0,0 14,0" />
        </svg>
      </div>
      <button
        type="button"
        onClick={onClick}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        onTouchStart={() => setPressed(true)}
        onTouchEnd={() => setPressed(false)}
        style={{
          border: 'none', cursor: 'pointer',
          borderRadius: 8, padding: '8px 16px',
          backgroundColor: Cjt.RED,
          color: Cjt.WHITE,
          fontFamily: 'm6x11plus, monospace',
          fontSize: 13, letterSpacing: 1.5,
          textShadow: '1px 1px 0 rgba(0,0,0,.7)',
          transform: pressed ? `translateY(${JIMBO_TABS_PRESS_Y}px)` : 'translateY(0)',
          boxShadow: pressed ? 'none' : `0 ${JIMBO_TABS_PRESS_Y}px 0 0 rgba(0,0,0,.5)`,
          transition: `transform ${JIMBO_TABS_PRESS_MS}ms ease, box-shadow ${JIMBO_TABS_PRESS_MS}ms ease`,
          opacity: active ? 1 : 0.78,
        }}
      >
        {label}
      </button>
    </div>
  );
}

function JimboTabs({ tabs, activeTab, onTabChange, style }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap', ...(style || {}) }}>
      {tabs.map((tab) => (
        <JimboTab
          key={tab.id}
          label={tab.label}
          active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        />
      ))}
    </div>
  );
}

window.JimboTabs = JimboTabs;
window.JimboTab = JimboTab;
