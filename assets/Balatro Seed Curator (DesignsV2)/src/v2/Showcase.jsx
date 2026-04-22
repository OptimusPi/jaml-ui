// Showcase — mobile landing screen.
// Big "Jammy Seed Finder" title, sprite marquee of recent winning seeds,
// row of 3 big primary actions (Browse filters / New filter / Recent searches),
// community recent results strip, Back docked bottom.

const { useState: shUS } = React;
const Csh = window.JimboColor;

function Showcase() {
  const hotFilters = [
    { name: 'Perkeo Observatory', author: 'Athuny & pifreak', hits: '12.4M', tone: 'blue',  sample: ['perkeo','blueprint','brainstorm'] },
    { name: 'The Daily Wee',      author: 'pifreak',          hits: '3.1M',  tone: 'red',   sample: ['weejoker','hangingchad','hack'] },
    { name: 'Lucky Cat',          author: 'JamlGenie',        hits: '128K',  tone: 'gold',  sample: ['luckycat','egg'] },
    { name: 'Fool Emperor Chain', author: 'ope',              hits: '42K',   tone: 'green', sample: ['showman'] },
  ];

  return (
    <div style={{
      width: '100%', height: '100%', background: Csh.DARKEST,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'm6x11plus, monospace', color: Csh.WHITE, overflow: 'hidden',
    }}>
      {/* Scroll body */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '18px 14px 10px' }}>
        {/* Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{
            fontSize: 32, letterSpacing: 3, lineHeight: 1,
            color: Csh.GOLD, textShadow: '2px 2px 0 rgba(0,0,0,.8)',
          }}>Balatro</div>
          <div style={{
            fontSize: 14, letterSpacing: 4, color: Csh.GREY, marginTop: 4,
            textShadow: '1px 1px 0 rgba(0,0,0,.8)',
          }}>SEED · CURATOR</div>
        </div>

        {/* Live stats card */}
        <div style={{
          background: Csh.DARK_GREY, borderRadius: 6, padding: 10,
          border: `2px solid ${Csh.PANEL_EDGE}`, boxShadow: `0 2px 0 ${Csh.BLACK}`,
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center', marginBottom: 16,
        }}>
          {[['15.6B','searched'],['2,847','matches'],['5.4M/s','speed']].map(([n,l]) => (
            <div key={l}>
              <div style={{ fontSize: 16, color: Csh.GOLD, textShadow: '1px 1px 0 rgba(0,0,0,.8)' }}>{n}</div>
              <div style={{ fontSize: 9, color: Csh.GREY, letterSpacing: 2, marginTop: 2 }}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            fontSize: 11, letterSpacing: 2, padding: '2px 8px',
            background: Csh.BLUE, color: Csh.WHITE, borderRadius: 3,
            textShadow: '1px 1px 0 rgba(0,0,0,.8)',
          }}>HOT FILTERS</div>
          <div style={{ flex: 1, height: 2, background: `${Csh.BLUE}55`, borderRadius: 1 }} />
        </div>

        {/* Filter cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {hotFilters.map((f, i) => {
            const tColor = f.tone === 'blue' ? Csh.BLUE : f.tone === 'red' ? Csh.RED : f.tone === 'gold' ? Csh.GOLD : Csh.GREEN;
            return (
              <div key={i} style={{
                background: Csh.DARK_GREY, borderRadius: 6, padding: 10,
                border: `2px solid ${tColor}`, boxShadow: `0 2px 0 ${Csh.BLACK}`,
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {f.sample.map((n, j) => (
                    <div key={j} style={{ width: 30, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <JokerMini name={n} size={28} />
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, color: Csh.WHITE, letterSpacing: 1,
                    textShadow: '1px 1px 0 rgba(0,0,0,.8)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{f.name}</div>
                  <div style={{ fontSize: 9, color: Csh.GOLD_TEXT, letterSpacing: 1, marginTop: 2 }}>by {f.author}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, color: tColor, textShadow: '1px 1px 0 rgba(0,0,0,.8)' }}>{f.hits}</div>
                  <div style={{ fontSize: 8, color: Csh.GREY, letterSpacing: 1 }}>seeds</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section — recent community finds */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            fontSize: 11, letterSpacing: 2, padding: '2px 8px',
            background: Csh.GREEN, color: Csh.WHITE, borderRadius: 3,
            textShadow: '1px 1px 0 rgba(0,0,0,.8)',
          }}>RECENT FINDS</div>
          <div style={{ flex: 1, height: 2, background: `${Csh.GREEN}55`, borderRadius: 1 }} />
        </div>
        <div style={{
          background: Csh.DARK_GREY, borderRadius: 6, padding: '8px 10px',
          border: `2px solid ${Csh.PANEL_EDGE}`, boxShadow: `0 2px 0 ${Csh.BLACK}`,
          fontSize: 11, color: Csh.GREY, letterSpacing: 1, lineHeight: 1.7,
        }}>
          <div><span style={{ color: Csh.GOLD_TEXT }}>X1B8TW4J</span> · Perkeo Observatory · +8</div>
          <div><span style={{ color: Csh.GOLD_TEXT }}>ALEPH999</span> · Lucky Cat · +5</div>
          <div><span style={{ color: Csh.GOLD_TEXT }}>UFX3G111</span> · Lucky Cat · +4</div>
          <div><span style={{ color: Csh.GOLD_TEXT }}>BETAZ3RO</span> · Daily Wee · +3</div>
        </div>

        <div style={{ height: 16 }} />
      </div>

      {/* Bottom thumb-zone actions */}
      <div style={{
        padding: '8px 10px 10px', borderTop: `2px solid ${Csh.BLACK}`, background: Csh.DARK_GREY,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <window.BalButton tone="green" fullWidth size="md">New Search</window.BalButton>
        <window.BalButton tone="blue"  fullWidth size="md">Browse Filters</window.BalButton>
        <window.BalButton tone="orange" fullWidth size="md">Back</window.BalButton>
      </div>
    </div>
  );
}

window.Showcase = Showcase;
