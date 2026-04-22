// v2 App shell — loads sprite maps then mounts SeedDetailV2 in a design canvas.

function AppV2() {
  const [ready, setReady] = React.useState(false);
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
      setReady(true);
    })();
  }, []);

  if (!ready) return <div style={{ padding: 40, color: '#fff', fontFamily: 'm6x11plus, monospace' }}>Loading sprites…</div>;

  return (
    <DesignCanvas>
      <DCSection id="v2" title="Seed Detail v2" subtitle="Flat ante model · per-clause score columns · COD-style edge hit indicators">
        <DCArtboard id="v2-main" label="Expanded seed (detail)" width={390} height={844}>
          <SeedDetailV2 seeds={window.SEEDS_V2} filter={window.FILTER_V2} />
        </DCArtboard>
        <DCArtboard id="v2-results" label="Search results · tap row to expand" width={390} height={844}>
          <SearchResultsV2 filter={window.FILTER_V2} />
        </DCArtboard>
      </DCSection>
      <DCSection id="v2-og" title="OG Card · /seed/[seed]/og.png" subtitle="1200×630 agnostic rollup — Discord unfurl, share link, embed">
        <DCArtboard id="v2-og-card" label="OG · winning seed" width={1200} height={630}>
          <SeedOGCard seed={window.SEEDS_V2[0]} filter={window.FILTER_V2} />
        </DCArtboard>
      </DCSection>
      <DCSection id="v2-builder" title="JAML Builder · mobile" subtitle="Mystery-slot grid + cascade picker bottom sheet · tap a '?' to open picker · tap a card to edit · X to remove">
        <DCArtboard id="v2-builder-main" label="Builder · default state" width={390} height={844}>
          <JamlBuilderV2 />
        </DCArtboard>
      </DCSection>
      <DCSection id="v2-showcase" title="Showcase · home/landing" subtitle="Mobile landing · live stats · hot filters · recent community finds">
        <DCArtboard id="v2-showcase-main" label="Showcase" width={390} height={844}>
          <Showcase />
        </DCArtboard>
      </DCSection>
      <DCSection id="v2-ide" title="JAML IDE · visual editor" subtitle="Drag clauses between MUST / SHOULD / MUST NOT · live YAML tab · what the community needs">
        <DCArtboard id="v2-ide-visual" label="IDE · Visual tab" width={390} height={844}>
          <JamlIde />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AppV2 />);
