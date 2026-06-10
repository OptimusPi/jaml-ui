/**
 * BalatroComponents.jsx — 1:1 port of jaml-ui/src/ui/* (master @ 9532700)
 *
 * All components mirror their JimboX counterpart in the repo: same props,
 * same defaults, same class names. Babel-compatible (no TS).
 *
 * Exports to window so other Babel scripts can use them without ES imports.
 */

// ─────────────────────────────────────────────────────────────────────────
// JimboText — pixel-font text wrapper
// ─────────────────────────────────────────────────────────────────────────

function JimboText({
  tone = 'default',
  size = 'md',
  shadow = true,
  dance = false,
  letterSpacing,
  as: Tag = 'span',
  className = '',
  style,
  children,
  ...rest
}) {
  const inlineStyle = {};
  if (letterSpacing != null) inlineStyle.letterSpacing = letterSpacing;
  if (style) Object.assign(inlineStyle, style);

  let content = children;
  if (dance && typeof children === 'string') {
    content = children.split('').map((char, i) => (
      <span key={i} className="j-font-dance-char" style={{ animationDelay: `${i * -0.15}s` }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  }

  return (
    <Tag
      className={`j-text j-text--${size} j-text--${tone} ${shadow ? '' : 'j-text--no-shadow'} ${dance ? 'j-text--dance-container' : ''} ${className}`.trim()}
      style={Object.keys(inlineStyle).length ? inlineStyle : undefined}
      {...rest}
    >
      {content}
    </Tag>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboButton — canonical chunky button
// Tones: orange | red | blue | green | tarot | planet | spectral | grey
// Sizes: xs | sm | md | lg
// ─────────────────────────────────────────────────────────────────────────

function JimboButton({
  tone = 'orange',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  style,
  className = '',
  children,
  ...buttonProps
}) {
  const textSize = size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';

  return (
    <button
      type="button"
      className={`j-btn j-btn--${tone} j-btn--${size} ${fullWidth ? 'j-btn--full' : ''} ${disabled ? 'j-btn--disabled' : ''} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
      style={style}
      {...buttonProps}
    >
      <div className="j-btn__face">
        <JimboText size={textSize}>{children}</JimboText>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboBackButton — the one true back button.
// Always orange, always sm, always fullWidth, lives at the bottom of the screen.
// (DESIGN.md: full-width thumb target, lowercase "back".)
// ─────────────────────────────────────────────────────────────────────────

function JimboBackButton({ onClick }) {
  return (
    <div className="j-back-btn-wrap j-flex j-justify-center j-w-full">
      <JimboButton tone="orange" size="sm" fullWidth onClick={onClick} className="j-back-btn">
        Back
      </JimboButton>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboPanel + JimboInnerPanel
// onBack renders the back button in the panel footer.
// ─────────────────────────────────────────────────────────────────────────

function JimboPanel({ children, className = '', onBack, hideBack = false, style, ...props }) {
  return (
    <div className={`j-panel ${className}`.trim()} style={style} {...props}>
      <div className="j-panel__body">{children}</div>
      {onBack && !hideBack && (
        <div className="j-panel__back">
          <JimboBackButton onClick={onBack} />
        </div>
      )}
    </div>
  );
}

function JimboInnerPanel({ children, className = '', style, ...props }) {
  return (
    <div className={`j-inner-panel ${className}`.trim()} style={style} {...props}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboModal
// ─────────────────────────────────────────────────────────────────────────

function JimboModal({ children, open, onClose, title, className, showBack = true }) {
  if (!open) return null;
  return (
    <div className="j-modal-overlay">
      <JimboPanel onBack={showBack ? onClose : undefined} className={`j-modal ${className ?? ''}`.trim()}>
        {title && (
          <JimboText as="h2" size="lg" className="j-modal__title">
            {title}
          </JimboText>
        )}
        {children}
      </JimboPanel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboBadge
// Tones: dark | blue | red | green | grey | orange | purple  (no gold)
// Sizes: sm | md
// ─────────────────────────────────────────────────────────────────────────

function JimboBadge({ size = 'sm', tone = 'dark', className, children, ...props }) {
  return (
    <span className={`j-badge j-badge--${size} j-badge--${tone} ${className ?? ''}`.trim()} {...props}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboListItem
// ─────────────────────────────────────────────────────────────────────────

const JimboListItem = React.forwardRef(function JimboListItem(
  { active = false, className = '', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={`j-list-item ${className}`.trim()}
      data-active={active}
      {...rest}
    >
      {children}
    </button>
  );
});

// ─────────────────────────────────────────────────────────────────────────
// JimboTextInput
// ─────────────────────────────────────────────────────────────────────────

const JimboTextInput = React.forwardRef(function JimboTextInput(
  { className = '', invalid = false, 'aria-invalid': ariaInvalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`j-text-input ${className}`.trim()}
      aria-invalid={ariaInvalid ?? invalid}
      data-invalid={invalid}
      {...props}
    />
  );
});

// ─────────────────────────────────────────────────────────────────────────
// JimboInlineEdit — borderless transparent input.
// Sizes: xs | sm | md | lg.  Tones: white | gold | grey.
// ─────────────────────────────────────────────────────────────────────────

const JimboInlineEdit = React.forwardRef(function JimboInlineEdit(
  { size = 'md', tone = 'white', dim = false, className = '', ...rest },
  ref,
) {
  const classes = [
    'j-inline-edit',
    `j-inline-edit--${size}`,
    `j-inline-edit--${tone}`,
    dim ? 'j-inline-edit--dim' : null,
    className || null,
  ]
    .filter(Boolean)
    .join(' ');
  return <input ref={ref} type="text" className={classes} {...rest} />;
});

// ─────────────────────────────────────────────────────────────────────────
// JimboLink — canonical anchor. External opens new tab.
// ─────────────────────────────────────────────────────────────────────────

function JimboLink({ external = true, className = '', children, ...anchorProps }) {
  const externalAttrs = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <a className={`j-link ${className}`.trim()} {...externalAttrs} {...anchorProps}>
      {children}
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboValueBadge — red pill numeric chip with click-to-edit.
// ─────────────────────────────────────────────────────────────────────────

function JimboValueBadge({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit,
  readOnly = false,
  className = '',
  style,
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(String(value));
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function startEditing() {
    setDraft(String(value));
    setEditing(true);
  }

  function commit() {
    const parsed = Number(draft);
    if (Number.isFinite(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      const snapped = step > 0 ? Math.round(clamped / step) * step : clamped;
      onChange?.(snapped);
    }
    setEditing(false);
  }

  function cancel() {
    setDraft(String(value));
    setEditing(false);
  }

  const interactive = !readOnly && !!onChange;
  const displayText = unit ? `${Math.round(value)}${unit}` : String(Math.round(value));

  if (editing) {
    return (
      <div className={`j-value-badge j-value-badge--editing ${className}`.trim()} style={style}>
        <input
          ref={inputRef}
          className="j-value-badge__input"
          type="number"
          min={min}
          max={max}
          step={step}
          value={draft}
          onChange={(e) => setDraft(e.currentTarget.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            else if (e.key === 'Escape') cancel();
          }}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`j-value-badge ${interactive ? '' : 'j-value-badge--static'} ${className}`.trim()}
      style={style}
      onClick={interactive ? startEditing : undefined}
      disabled={!interactive}
      tabIndex={interactive ? 0 : -1}
    >
      <JimboText size="xs" tone="white">
        {displayText}
      </JimboText>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboSlider — range with badge thumb
// ─────────────────────────────────────────────────────────────────────────

function JimboSlider({
  value,
  min = 0,
  max = 100,
  step = 1,
  label,
  onChange,
  className = '',
  id,
}) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <div className={`j-slider-wrap ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="j-slider__label">
          <JimboText size="sm" tone="white">{label}</JimboText>
        </label>
      )}
      <div className="j-slider">
        <div className="j-slider__track" aria-hidden>
          <div className="j-slider__fill" style={{ width: `${pct}%` }} />
        </div>
        <input
          id={inputId}
          type="range"
          className="j-slider__input"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange?.(Number(e.currentTarget.value))}
        />
        <div className="j-slider__thumb" style={{ left: `${pct}%` }}>
          <JimboValueBadge value={value} min={min} max={max} step={step} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboStepper — page-dot indicator
// ─────────────────────────────────────────────────────────────────────────

function JimboStepper({ count, index, onIndexChange, ariaLabel = 'Page indicator', className = '', style }) {
  if (count <= 1) return null;
  const interactive = !!onIndexChange;

  return (
    <div className={`j-stepper ${className}`.trim()} role="tablist" aria-label={ariaLabel} style={style}>
      {Array.from({ length: count }).map((_, i) => {
        const active = i === index;
        const dot = <span className="j-stepper__dot" data-active={active} aria-hidden />;
        if (!interactive) {
          return (
            <span key={i} role="tab" aria-selected={active}>
              {dot}
            </span>
          );
        }
        return (
          <button
            key={i}
            type="button"
            className="j-stepper__hit"
            role="tab"
            aria-selected={active}
            aria-label={`Page ${i + 1} of ${count}`}
            onClick={() => onIndexChange?.(i)}
          >
            {dot}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboDualChip — 0×0 hands × discards style
// ─────────────────────────────────────────────────────────────────────────

function JimboDualChip({ left, right, className = '' }) {
  return (
    <div className={`j-dual-chip ${className}`.trim()}>
      <div className={`j-dual-chip__half j-dual-chip__half--left j-dual-chip__half--${left.tone}`}>
        <JimboText size="md" tone={left.tone === 'gold' ? 'default' : 'white'}>{left.value}</JimboText>
      </div>
      <div className={`j-dual-chip__half j-dual-chip__half--${right.tone}`}>
        <JimboText size="md" tone={right.tone === 'gold' ? 'default' : 'white'}>{right.value}</JimboText>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboTabs — horizontal tabs with bouncing triangle indicator
// ─────────────────────────────────────────────────────────────────────────

function JimboTabs({ tabs, activeTab, onTabChange, className = '', style }) {
  return (
    <div className={`j-tabs ${className}`.trim()} style={style}>
      {tabs.map((tab) => (
        <div key={tab.id} className="j-tab" data-active={activeTab === tab.id}>
          <div className="j-tab__indicator" data-active={activeTab === tab.id} aria-hidden>
            <svg width={14} height={10} viewBox="0 0 14 10">
              <polygon points="7,10 0,0 14,0" />
            </svg>
          </div>
          <button
            type="button"
            className="j-tab__btn"
            data-active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          >
            <JimboText size="sm" tone="default">{tab.label}</JimboText>
          </button>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboInfoCard + slots — generic clickable row card
// ─────────────────────────────────────────────────────────────────────────

function JimboInfoCard({ tone, children, className = '', ...props }) {
  const borderClass = tone ? `j-border--${tone}` : '';
  return (
    <div className={`j-info-card ${borderClass} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
function JimboInfoCardBody({ children, className = '' }) {
  return <div className={`j-info-card__body ${className}`.trim()}>{children}</div>;
}
function JimboInfoCardTitle({ children, className = '' }) {
  return <div className={`j-info-card__title ${className}`.trim()}>{children}</div>;
}
function JimboInfoCardSub({ children, className = '' }) {
  return <div className={`j-info-card__sub ${className}`.trim()}>{children}</div>;
}
function JimboInfoCardAside({ children, className = '' }) {
  return <div className={`j-info-card__aside ${className}`.trim()}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────────────────
// JimboCopyButton — canonical copy-to-clipboard button
// ─────────────────────────────────────────────────────────────────────────

function JimboCopyButton({
  value,
  label = 'copy',
  copiedLabel = 'copied!',
  tone = 'blue',
  size = 'sm',
  copiedDurationMs = 1500,
  onCopy,
  className,
}) {
  const [copied, setCopied] = React.useState(false);

  function handleClick() {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      onCopy?.();
      window.setTimeout(() => setCopied(false), copiedDurationMs);
    });
  }

  return (
    <JimboButton tone={tone} size={size} onClick={handleClick} className={className}>
      {copied ? copiedLabel : label}
    </JimboButton>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboSeedCopyChip — tap-to-copy seed row (WeeJoker harvest)
// ─────────────────────────────────────────────────────────────────────────

function JimboSeedCopyChip({
  value,
  placeholder = '--------',
  disabled = false,
  copiedLabel = 'copied!',
  copiedDurationMs = 2000,
  onCopy,
  className = '',
  style,
}) {
  const [copied, setCopied] = React.useState(false);
  const display = value.trim();
  const canCopy = !disabled && display.length > 0;

  const handleCopy = async () => {
    if (!canCopy) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(display);
      }
    } catch {}
    setCopied(true);
    onCopy?.(display);
    window.setTimeout(() => setCopied(false), copiedDurationMs);
  };

  return (
    <button
      type="button"
      className={`j-seed-copy ${className}`.trim()}
      style={style}
      onClick={handleCopy}
      disabled={!canCopy}
      data-copied={copied}
      aria-label={canCopy ? `Copy seed ${display}` : 'Seed unavailable'}
    >
      <span className="j-seed-copy__icon" aria-hidden>
        {copied ? '✓' : '⧉'}
      </span>
      <span className="j-seed-copy__text">{copied ? copiedLabel : display || placeholder}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboCopyRow — label + JimboSeedCopyChip
// ─────────────────────────────────────────────────────────────────────────

function JimboCopyRow({ value, label }) {
  return (
    <div className="j-copy-row">
      {label && (
        <JimboText size="xs" tone="grey" className="j-copy-row__label">
          {label}
        </JimboText>
      )}
      <JimboSeedCopyChip value={value} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboIconButton — small square icon button
// Tones: default | destructive
// ─────────────────────────────────────────────────────────────────────────

const ICONBTN_SIZE_PX = { xs: 22, sm: 26, md: 30 };
const ICONBTN_TONE_BG = {
  default: { rest: '#1e2b2d', hover: '#3a5055', border: '#1e2e32' },
  destructive: { rest: '#ff4c40', hover: '#ff9800', border: '#000000' },
};

function JimboIconButton({
  onClick,
  onMouseDown,
  onTouchStart,
  title,
  'aria-label': ariaLabel,
  disabled = false,
  size = 'md',
  tone = 'default',
  children,
}) {
  const [hover, setHover] = React.useState(false);
  const side = ICONBTN_SIZE_PX[size];
  const palette = ICONBTN_TONE_BG[tone];
  const borderWidth = tone === 'destructive' ? 2 : 1;
  const boxShadow =
    tone === 'destructive'
      ? 'inset 0 1px 0 rgba(255,255,255,.2), 0 2px 0 #000'
      : undefined;

  return (
    <button
      aria-label={ariaLabel ?? title}
      disabled={disabled}
      onClick={(e) => !disabled && onClick?.(e)}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: side,
        height: side,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: hover && !disabled ? palette.hover : palette.rest,
        color: '#fff',
        border: `${borderWidth}px solid ${palette.border}`,
        borderRadius: 4,
        boxShadow,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        padding: 0,
        fontSize: 14,
        lineHeight: 1,
        transition: 'background 80ms ease',
      }}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboFlankNav — prev/next chevron buttons around content
// ─────────────────────────────────────────────────────────────────────────

function JimboFlankNav({
  onPrev,
  onNext,
  canPrev = true,
  canNext = true,
  prevLabel = 'Previous',
  nextLabel = 'Next',
  children,
  className = '',
  style,
}) {
  return (
    <div className={`j-flank ${className}`.trim()} style={style}>
      <FlankNavBtn direction="left" onClick={onPrev} disabled={!canPrev} aria-label={prevLabel} />
      <div className="j-flank__content">{children}</div>
      <FlankNavBtn direction="right" onClick={onNext} disabled={!canNext} aria-label={nextLabel} />
    </div>
  );
}

function FlankNavBtn({ direction, onClick, disabled, 'aria-label': ariaLabel }) {
  const [pressed, setPressed] = React.useState(false);
  const points = direction === 'left' ? '18,4 8,14 18,24' : '10,4 20,14 10,24';
  return (
    <button
      type="button"
      className="j-flank__btn"
      data-pressed={pressed && !disabled}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={ariaLabel}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => !disabled && setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      <svg width={28} height={28} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polyline points={points} />
      </svg>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboSpinner — `< value >` cycler. The canonical option-cycler in Balatro.
// (Game Speed, Shadows On/Off, page navigation, etc.)
// NOT to be confused with JimboStepper (page-dot indicator).
// ─────────────────────────────────────────────────────────────────────────

function JimboSpinner({
  value,
  label,
  onPrev,
  onNext,
  canPrev = true,
  canNext = true,
  className = '',
}) {
  return (
    <div className={`j-spinner-wrap ${className}`.trim()}>
      {label && (
        <div className="j-spinner__label">
          <JimboText size="sm" tone="white">{label}</JimboText>
        </div>
      )}
      <div className="j-spinner">
        <JimboButton
          tone="red"
          size="sm"
          onClick={onPrev}
          disabled={!canPrev}
          aria-label={`Previous ${label ?? 'value'}`}
        >
          {'<'}
        </JimboButton>
        <div className="j-spinner__value">
          <JimboText size="sm" tone="white">{value}</JimboText>
        </div>
        <JimboButton
          tone="red"
          size="sm"
          onClick={onNext}
          disabled={!canNext}
          aria-label={`Next ${label ?? 'value'}`}
        >
          {'>'}
        </JimboButton>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboSelect — cycles through options via JimboSpinner
// ─────────────────────────────────────────────────────────────────────────

function JimboSelect({
  value,
  options,
  onChange,
  disabled = false,
  label,
  'aria-label': ariaLabel,
  style,
}) {
  const normalized = options.length === 0
    ? []
    : typeof options[0] === 'string'
      ? options.map((v) => ({ value: v }))
      : options;

  const enabled = normalized.filter((o) => !o.disabled);
  const idx = Math.max(0, enabled.findIndex((o) => o.value === value));
  const current = enabled[idx] ?? enabled[0];
  if (!current) return null;

  function step(delta) {
    if (disabled || enabled.length === 0) return;
    const next = (idx + delta + enabled.length) % enabled.length;
    onChange(enabled[next].value);
  }

  return (
    <div style={style} aria-label={ariaLabel}>
      <JimboSpinner
        label={label}
        value={current.label ?? current.value}
        onPrev={() => step(-1)}
        onNext={() => step(+1)}
        canPrev={!disabled && enabled.length > 1}
        canNext={!disabled && enabled.length > 1}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboPanelSpinner — the BIG cycler. Large red arrows flank a card with
// media + title + meta + description. Deck picker, stake picker, etc.
// ─────────────────────────────────────────────────────────────────────────

function JimboPanelSpinner({
  label,
  title,
  description,
  media,
  meta,
  className = '',
  style,
  onPrev,
  onNext,
  prevDisabled = false,
  nextDisabled = false,
}) {
  return (
    <div className={`j-panel-spinner ${className}`.trim()} style={style}>
      {label && (
        <div className="j-panel-spinner__label">
          <JimboText size="xs" tone="grey">{label}</JimboText>
        </div>
      )}
      <div className="j-panel-spinner__row">
        <JimboButton
          tone="red"
          size="lg"
          className="j-panel-spinner__arrow j-panel-spinner__arrow--left"
          onClick={onPrev}
          disabled={prevDisabled}
          aria-label="Previous"
        >
          {'<'}
        </JimboButton>
        <div className="j-panel-spinner__panel">
          {media && <div className="j-panel-spinner__media">{media}</div>}
          <div className="j-panel-spinner__title">
            <JimboText size="md" tone="white">{title}</JimboText>
          </div>
          {meta && <div className="j-panel-spinner__meta">{meta}</div>}
          {description && (
            <div className="j-panel-spinner__description">
              <JimboText size="micro" tone="grey">{description}</JimboText>
            </div>
          )}
        </div>
        <JimboButton
          tone="red"
          size="lg"
          className="j-panel-spinner__arrow j-panel-spinner__arrow--right"
          onClick={onNext}
          disabled={nextDisabled}
          aria-label="Next"
        >
          {'>'}
        </JimboButton>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Export all to window
// ─────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────
// LAYOUT HELPERS — JimboStack, JimboRow, JimboDivider
// ─────────────────────────────────────────────────────────────────────────

function JimboStack({ children, gap = 'md', className = '', style, ...rest }) {
  return (
    <div className={`j-stack j-stack--${gap} ${className}`.trim()} style={style} {...rest}>
      {children}
    </div>
  );
}

function JimboRow({ children, gap = 'md', justify, className = '', style, ...rest }) {
  const justifyClass = justify ? `j-row--${justify}` : '';
  return (
    <div className={`j-row j-row--${gap} ${justifyClass} ${className}`.trim()} style={style} {...rest}>
      {children}
    </div>
  );
}

function JimboDivider({ orientation = 'horizontal', className = '' }) {
  const orient = orientation === 'vertical' ? 'j-divider--vert' : '';
  return <hr className={`j-divider ${orient} ${className}`.trim()} />;
}

// ─────────────────────────────────────────────────────────────────────────
// JimboStatCallout — colored label strip + big pixel number.
// The HUD primitive: Hands / Discards / $ / Ante / Round / Round Score.
// ─────────────────────────────────────────────────────────────────────────

function JimboStatCallout({
  label,
  value,
  tone = 'red',
  valueTone,
  className = '',
  style,
}) {
  const valueClass = valueTone ? `j-stat__value--${valueTone}` : '';
  return (
    <div className={`j-stat ${className}`.trim()} style={style}>
      <div className={`j-stat__label j-stat__label--${tone}`}>{label}</div>
      <div className={`j-stat__value ${valueClass}`.trim()}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboSectionHeader — colored strip across panel top + title + downward
// triangle tab. Marks the active page of a multi-tab area.
// ─────────────────────────────────────────────────────────────────────────

function JimboSectionHeader({ title, tone = 'red', className = '', style }) {
  return (
    <div className={`j-section-header ${className}`.trim()} style={style}>
      <div className={`j-section-header__bar j-section-header__bar--${tone}`}>
        {title}
      </div>
      <div className={`j-section-header__triangle j-section-header__triangle--${tone}`} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboSidewaysLabel — vertical ALL-CAPS pixel text along a panel edge.
// E.g. "ANTE 4 VOUCHER" on the side of the shop's voucher panel.
// ─────────────────────────────────────────────────────────────────────────

function JimboSidewaysLabel({ children, className = '', style }) {
  return (
    <div className={`j-sideways-label ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboPriceTag — yellow $X badge that floats above an item.
// Pass `float` to absolute-position it at the top-center of its parent.
// ─────────────────────────────────────────────────────────────────────────

function JimboPriceTag({ amount, float = false, className = '', style }) {
  return (
    <span
      className={`j-price-tag ${float ? 'j-price-tag--float' : ''} ${className}`.trim()}
      style={style}
    >
      ${amount}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboToggle — flat checkbox with pixel ✓. Tones: blue (default) | green |
// red | orange.
// ─────────────────────────────────────────────────────────────────────────

function JimboToggle({ checked = false, onChange, tone = 'blue', className = '', 'aria-label': ariaLabel }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      data-on={checked}
      className={`j-toggle j-toggle--${tone} ${className}`.trim()}
      onClick={() => onChange?.(!checked)}
    />
  );
}

function JimboToggleRow({ label, checked, onChange, tone = 'blue' }) {
  return (
    <label className="j-toggle-row" onClick={(e) => e.preventDefault()}>
      <JimboToggle checked={checked} onChange={onChange} tone={tone} aria-label={label} />
      <JimboText size="sm" tone="white">{label}</JimboText>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboTooltip — small panel that pops above its trigger. Visible on hover
// + focus by default; pass `open` to force-show.
// ─────────────────────────────────────────────────────────────────────────

function JimboTooltip({ children, content, open, className = '' }) {
  const [hover, setHover] = React.useState(false);
  const visible = open ?? hover;
  return (
    <span
      className={`j-tooltip ${className}`.trim()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      {children}
      {visible && content && (
        <span className="j-tooltip__bubble" role="tooltip">
          {content}
          <span className="j-tooltip__pointer" />
        </span>
      )}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboMarquee — the SHOP sign. Red panel + dotted-bulb perimeter + gold
// pixel headline + optional subtitle.
// ─────────────────────────────────────────────────────────────────────────

function JimboMarquee({ title, subtitle, className = '', style }) {
  return (
    <div className={`j-marquee ${className}`.trim()} style={style}>
      <div className="j-marquee__bulbs" aria-hidden />
      <div className="j-marquee__title">{title}</div>
      {subtitle && <div className="j-marquee__sub">{subtitle}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboToast — auto-dismiss notification. Mount in a portal-ish host.
// Use as a controlled component: render when `open` is true.
// ─────────────────────────────────────────────────────────────────────────

function JimboToast({ message, tone, durationMs = 2000, onDismiss }) {
  React.useEffect(() => {
    if (!onDismiss) return;
    const t = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(t);
  }, [durationMs, onDismiss]);

  return (
    <div className="j-toast-host">
      <div className={`j-toast ${tone ? `j-toast--${tone}` : ''}`.trim()}>{message}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboProgressBar — horizontal track with fill. Optional right-aligned
// caption (e.g. "62%" or "21/52").
// ─────────────────────────────────────────────────────────────────────────

function JimboProgressBar({ value, max = 100, tone = 'blue', caption, className = '', style }) {
  const pct = max === 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`j-progress ${className}`.trim()} style={style}>
      <div className="j-progress__track" role="progressbar" aria-valuenow={value} aria-valuemax={max}>
        <div className={`j-progress__fill j-progress__fill--${tone}`} style={{ width: `${pct}%` }} />
      </div>
      {caption && <div className="j-progress__caption">{caption}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboStatusPill — single-word state badge (idle/running/ok/error/paused).
// Specialization of badge with a leading colored dot.
// ─────────────────────────────────────────────────────────────────────────

function JimboStatusPill({ status, label, className = '' }) {
  return (
    <span className={`j-status-pill j-status-pill--${status} ${className}`.trim()}>
      <span className="j-status-pill__dot" aria-hidden />
      {label ?? status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboErrorBlock — red-tinted panel with title + message. For surfacing
// runtime errors inline (failed search, broken parse, etc).
// ─────────────────────────────────────────────────────────────────────────

function JimboErrorBlock({ title, children, className = '', style }) {
  return (
    <div className={`j-error-block ${className}`.trim()} style={style}>
      {title && <div className="j-error-block__title">{title}</div>}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// JimboConfirmPrompt — small modal with a question + confirm/cancel buttons.
// Confirm tone defaults to red (destructive); pass tone="green" for safe ops.
// ─────────────────────────────────────────────────────────────────────────

function JimboConfirmPrompt({
  open,
  message,
  confirmLabel = 'yes',
  cancelLabel = 'cancel',
  confirmTone = 'red',
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div className="j-modal-overlay">
      <JimboPanel>
        <JimboStack gap="md">
          <JimboText size="md" tone="white">{message}</JimboText>
          <JimboRow gap="sm" justify="end">
            <JimboButton tone="grey" size="sm" onClick={onCancel}>{cancelLabel}</JimboButton>
            <JimboButton tone={confirmTone} size="sm" onClick={onConfirm}>{confirmLabel}</JimboButton>
          </JimboRow>
        </JimboStack>
      </JimboPanel>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Update window exports
// ─────────────────────────────────────────────────────────────────────────

Object.assign(window, {
  JimboStack,
  JimboRow,
  JimboDivider,
  JimboStatCallout,
  JimboSectionHeader,
  JimboSidewaysLabel,
  JimboPriceTag,
  JimboToggle,
  JimboToggleRow,
  JimboTooltip,
  JimboMarquee,
  JimboToast,
  JimboProgressBar,
  JimboStatusPill,
  JimboErrorBlock,
  JimboConfirmPrompt,
});
