import { Button as BaseButton } from '@base-ui/react/button';
import { forwardRef, useId, type ReactNode } from 'react';
import type { Tone } from '../tokens.ts';
import { cx } from '../utils/cx.ts';
import { Tooltip } from './Tooltip.tsx';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<BaseButton.Props, 'className' | 'children'> {
  children?: ReactNode;
  /** Face colour. @default 'orange' */
  tone?: Tone;
  /** @default 'md' */
  size?: ButtonSize;
  /** Stretch to fill the row. */
  block?: boolean;
  /**
   * Why the button can't be used right now. Shown as a tooltip and read by screen
   * readers, and keeps the button focusable so keyboard users can find out too.
   * Only used when `disabled` is true.
   */
  disabledReason?: ReactNode;
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, tone = 'orange', size = 'md', block, disabled, disabledReason, className, ...rest },
  ref,
) {
  const reasonId = useId();
  const explain = Boolean(disabled && disabledReason);

  const button = (
    <BaseButton
      ref={ref}
      {...rest}
      disabled={disabled}
      focusableWhenDisabled={explain || rest.focusableWhenDisabled}
      aria-describedby={cx(rest['aria-describedby'], explain && reasonId) || undefined}
      className={cx('j-button', className)}
      data-tone={tone}
      data-size={size}
      data-block={block || undefined}
    >
      <span className="j-button__face">{children}</span>
    </BaseButton>
  );

  if (!explain) return button;

  return (
    <>
      <Tooltip content={disabledReason}>{button}</Tooltip>
      <span id={reasonId} className="j-sr-only">
        {disabledReason}
      </span>
    </>
  );
});
