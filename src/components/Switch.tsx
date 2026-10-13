import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { forwardRef, type ReactNode } from 'react';
import type { Tone } from '../tokens.ts';
import { cx } from '../utils/cx.ts';

export interface SwitchProps extends Omit<BaseSwitch.Root.Props, 'className' | 'children'> {
  /** Text beside the box. Clicking it toggles too. */
  label: ReactNode;
  /** Fill when on. @default 'red' */
  tone?: Tone;
  className?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { label, tone = 'red', className, ...rest },
  ref,
) {
  return (
    <label className={cx('j-switch', className)} data-tone={tone} data-disabled={rest.disabled || undefined}>
      <span className="j-switch__label">{label}</span>
      <BaseSwitch.Root ref={ref} {...rest} className="j-switch__box">
        <BaseSwitch.Thumb className="j-switch__tick" />
      </BaseSwitch.Root>
    </label>
  );
});
