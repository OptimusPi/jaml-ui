import { forwardRef, type HTMLAttributes } from 'react';
import type { Tone } from '../tokens.ts';
import { cx } from '../utils/cx.ts';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** @default 'orange' */
  tone?: Tone;
  /** @default 'md' */
  size?: 'sm' | 'md';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = 'orange', size = 'md', className, ...rest },
  ref,
) {
  return <span ref={ref} {...rest} className={cx('j-badge', className)} data-tone={tone} data-size={size} />;
});
