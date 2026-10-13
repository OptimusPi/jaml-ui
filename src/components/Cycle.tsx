import { useId, useState, type ReactNode } from 'react';
import type { Tone } from '../tokens.ts';
import { cx } from '../utils/cx.ts';
import { Button } from './Button.tsx';

export interface CycleOption<T extends string | number> {
  value: T;
  label: ReactNode;
}

export interface CycleProps<T extends string | number> {
  /** What is being chosen, e.g. "Deck" or "Stake". */
  label: ReactNode;
  options: readonly CycleOption<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  /** Arrow button tone. @default 'red' */
  tone?: Tone;
  /** Show one pip per option under the value. @default true when 12 or fewer options */
  pips?: boolean;
  /** Wrap from last to first and back. @default true */
  loop?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * The Balatro option cycle: ◀ value ▶ with position pips underneath. Best for short
 * lists you step through (decks, stakes, speeds). For long lists, use Select.
 */
export function Cycle<T extends string | number>({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  tone = 'red',
  pips,
  loop = true,
  disabled,
  className,
}: CycleProps<T>) {
  const id = useId();
  const [inner, setInner] = useState<T | undefined>(defaultValue ?? options[0]?.value);
  const current = value !== undefined ? value : inner;
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === current),
  );
  const count = options.length;
  const showPips = pips ?? count <= 12;

  const go = (step: -1 | 1) => {
    let next = index + step;
    if (loop) next = (next + count) % count;
    else next = Math.min(count - 1, Math.max(0, next));
    const option = options[next];
    if (!option || next === index) return;
    if (value === undefined) setInner(option.value);
    onValueChange?.(option.value);
  };

  const atStart = !loop && index === 0;
  const atEnd = !loop && index === count - 1;

  return (
    <div role="group" aria-labelledby={`${id}-label`} className={cx('j-cycle', className)} data-tone={tone}>
      <span id={`${id}-label`} className="j-cycle__label">
        {label}
      </span>
      <div className="j-cycle__row">
        <Button
          tone={tone}
          size="sm"
          className="j-cycle__arrow"
          aria-label="Previous"
          disabled={disabled || atStart}
          onClick={() => go(-1)}
        >
          <span aria-hidden="true">{'<'}</span>
        </Button>
        <div className="j-cycle__value" aria-live="polite" aria-atomic="true">
          <span className="j-cycle__text">{options[index]?.label}</span>
          {showPips && (
            <span className="j-cycle__pips" aria-hidden="true">
              {options.map((o, i) => (
                <span key={String(o.value)} className="j-cycle__pip" data-active={i === index || undefined} />
              ))}
            </span>
          )}
        </div>
        <Button
          tone={tone}
          size="sm"
          className="j-cycle__arrow"
          aria-label="Next"
          disabled={disabled || atEnd}
          onClick={() => go(1)}
        >
          <span aria-hidden="true">{'>'}</span>
        </Button>
      </div>
    </div>
  );
}
