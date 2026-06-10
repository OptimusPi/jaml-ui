// App shell — wraps SeedDetail in a design_canvas artboard at phone size.

function App() {
  const [mapsReady, setMapsReady] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      await Promise.all([
        window.loadSpriteMap('jokers',   'assets/jokers.json'),
        window.loadSpriteMap('tarots',   'assets/tarots.json'),
        window.loadSpriteMap('vouchers', 'assets/vouchers.json'),
        window.loadSpriteMap('tags',     'assets/tags.json'),
        window.loadSpriteMap('boosters', 'assets/boosters.json'),
        window.loadSpriteMap('blinds',   'assets/blinds.json'),
      ]);
      setMapsReady(true);
    })();
  }, []);

  if (!mapsReady) {
    return <div style={{ padding: 40, color: '#fff', fontFamily: 'm6x11plus, monospace' }}>Loading sprites…</div>;
  }

  return (
    <DesignCanvas>
      <DCSection id="seed-detail" title="Seed Detail" subtitle="Mobile seed view — swipe ↕ between antes, ↔ between seeds">
        <DCArtboard id="hifi" label="Hi-fi · Balatro native" width={390} height={844}>
          <SeedDetail seeds={window.MOCK_SEEDS} filter={window.MOCK_FILTER} />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
