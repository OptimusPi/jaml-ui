// AntePage — one ante's worth of content, scrolled vertically.
//   [voucher row + tags row]
//   [SMALL BLIND section: boss chip + pack(s) + 6 shop items in 2×3]
//   [BIG BLIND section: ditto]
//   [BOSS BLIND section: ditto]
//
// Pack tap → fan-out of contents below the pack.
// Tag tap → reveal of reward preview (same motion as pack tap).
// Hit items display a corner stamp; a footer strip shows the per-clause
// running tally across the seed.

const { useState: uS, useMemo: uM } = React;

// ── Small chrome: a pixel-border card (Balatro panels) ───────
function BalatroPanel({ children, style = {}, color = '#2a3336' }) {
  return (
    <div
      style={{
        background: color,
        border: '2px solid #1e2b2d',
        borderRadius: 6,
        boxShadow: 'inset 0 0 0 1px #3e4a4d, 0 2px 0 #0b1416',
        padding: 10,
        color: '#fff',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Chunky Balatro section header pill ───────────────────────
function BlindHeader({ kind, boss, onTap }) {
  const label = kind === 'small' ? 'SMALL BLIND' : kind === 'big' ? 'BIG BLIND' : 'BOSS BLIND';
  const color = kind === 'boss' ? '#6d2b2b' : '#2b3a5e';
  return (
    <div
      onClick={onTap}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: color,
        padding: '6px 12px 6px 8px',
        border: '2px solid #1e2b2d',
        borderRadius: 18,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 2px 0 #0b1416',
        cursor: onTap ? 'pointer' : 'default',
        alignSelf: 'flex-start',
      }}
    >
      <BossChip name={boss || (kind === 'boss' ? 'TheOx' : kind === 'big' ? 'BigBlind' : 'SmallBlind')} size={32} />
      <span style={{ fontFamily: 'm6x11plus, monospace', fontSize: 16, letterSpacing: 1, color: '#fff' }}>{label}</span>
    </div>
  );
}

// ── FanOut — used by tap-to-reveal (packs and tags). Renders row of
//     children sliding + fading in from under the parent.
function FanOut({ open, children }) {
  return (
    <div
      style={{
        overflow: 'hidden',
        transition: 'max-height 260ms cubic-bezier(.33,1,.4,1), opacity 180ms',
        maxHeight: open ? 180 : 0,
        opacity: open ? 1 : 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '10px 0 4px',
          transform: open ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'transform 260ms cubic-bezier(.33,1,.4,1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── PackCluster — the pack sprite, plus an expanded fan-out of its cards
function PackCluster({ pack }) {
  const [open, setOpen] = uS(false);
  const kind = pack.kind.toLowerCase();
  const hitKinds = pack.contents?.flatMap((c) => c.hits || []) || [];
  const firstHit = hitKinds.length ? 'should' : null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <PackSprite kind={kind} size={56} onClick={() => setOpen((o) => !o)} open={open} hit={firstHit} />
      {pack.contents?.length ? (
        <FanOut open={open}>
          {pack.contents.map((c, i) => (
            <CardItem key={i} item={c} size={46} />
          ))}
        </FanOut>
      ) : null}
    </div>
  );
}

// ── CardItem — renders a shop/pack item by kind.
function CardItem({ item, size = 58 }) {
  const hit = item.hits && item.hits.length ? (item.hits.some((h) => h.startsWith('m')) ? 'must' : 'should') : null;
  if (item.kind === 'Joker') return <JokerMini name={item.name} size={size} hit={hit} edition={item.edition} />;
  if (item.kind === 'Tarot') return <TarotMini name={item.name} size={size} hit={hit} />;
  if (item.kind === 'Voucher') return <VoucherMini name={item.name} size={size} hit={hit} />;
  return null;
}

// ── TagReveal — tap a tag, see its preview (mock)
function TagCluster({ tag }) {
  const [open, setOpen] = uS(false);
  const preview = TAG_PREVIEWS[tag.name.toLowerCase()] || { label: tag.name, body: 'Tag reward preview' };
  const hit = tag.hits && tag.hits.length ? 'should' : null;
  return (
    <div style={{ position: 'relative' }}>
      <div onClick={() => setOpen((o) => !o)} style={{ cursor: 'pointer' }}>
        <TagChip name={tag.name} size={30} hit={hit} />
      </div>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1e2b2d',
            border: '2px solid #3e4a4d',
            borderRadius: 6,
            padding: '6px 10px',
            fontFamily: 'm6x11plus, monospace',
            fontSize: 12,
            color: '#fff',
            whiteSpace: 'nowrap',
            zIndex: 10,
            boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
          }}
          onClick={() => setOpen(false)}
        >
          <div style={{ color: '#e4b643' }}>{preview.label}</div>
          <div style={{ opacity: 0.75, fontSize: 10, marginTop: 2 }}>{preview.body}</div>
        </div>
      )}
    </div>
  );
}

const TAG_PREVIEWS = {
  raretag: { label: 'RARE TAG', body: 'Next shop: Free Rare Joker' },
  uncommontag: { label: 'UNCOMMON TAG', body: 'Next shop: Free Uncommon Joker' },
  negativetag: { label: 'NEGATIVE TAG', body: 'Next base Joker becomes Negative' },
  foiltag: { label: 'FOIL TAG', body: 'Next base Joker becomes Foil' },
  holographictag: { label: 'HOLO TAG', body: 'Next base Joker becomes Holographic' },
  polychrometag: { label: 'POLY TAG', body: 'Next base Joker becomes Polychrome' },
  topuptag: { label: 'TOP-UP TAG', body: 'Create up to 2 Common Jokers' },
  standardtag: { label: 'STANDARD TAG', body: 'Free Standard Booster Pack' },
  charmtag: { label: 'CHARM TAG', body: 'Free Mega Arcana Pack' },
  meteortag: { label: 'METEOR TAG', body: 'Free Mega Celestial Pack' },
};

// ── BlindSection — boss header + packs + shop 6 items in 2 rows of 3
function BlindSection({ blind }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
      <BlindHeader kind={blind.kind} boss={blind.boss} />
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {blind.shop.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
                <CardItem item={item} size={58} />
              </div>
            ))}
          </div>
        </div>
        {blind.packs && blind.packs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {blind.packs.map((p, i) => <PackCluster key={i} pack={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── AntePage — voucher + tags row, then all three blinds
function AntePage({ ante }) {
  if (ante.isPre) {
    return (
      <div style={{ padding: 20, color: '#b0c0c4', fontFamily: 'm6x11plus, monospace', fontSize: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: '#fff', marginBottom: 8 }}>RUN START</div>
        <div style={{ opacity: 0.7 }}>Swipe up to Ante 1 →</div>
      </div>
    );
  }
  return (
    <div style={{ padding: '16px 14px 40px' }}>
      {/* Ante header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 22, color: '#fff', letterSpacing: 1 }}>ANTE {ante.ante}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {ante.tags.map((t, i) => <TagCluster key={i} tag={t} />)}
        </div>
      </div>

      {/* Voucher strip */}
      {ante.voucher ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '8px 10px', background: '#1a2529', border: '2px solid #0b1416', borderRadius: 6 }}>
          <VoucherMini name={ante.voucher.name} size={50} hit={ante.voucher.hits?.length ? 'should' : null} />
          <div>
            <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 11, color: '#7e8e91', letterSpacing: 1 }}>VOUCHER</div>
            <div style={{ fontFamily: 'm6x11plus, monospace', fontSize: 15, color: '#fff' }}>{ante.voucher.name}</div>
          </div>
        </div>
      ) : null}

      {ante.blinds.map((b) => <BlindSection key={b.kind} blind={b} />)}
    </div>
  );
}

window.AntePage = AntePage;
window.BalatroPanel = BalatroPanel;
