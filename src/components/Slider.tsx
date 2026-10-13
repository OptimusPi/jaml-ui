import { Slider as BaseSlider } from '@base-ui/react/slider';
import { forwardRef, type ReactNode } from 'react';
import type { Tone } from '../tokens.ts';
import { cx } from '../utils/cx.ts';

export interface SliderProps extends Omit<BaseSlider.Root.Props<number>, 'className' | 'children'> {
  label: ReactNode;
  /** Fill colour. @default 'red' */
  tone?: Tone;
  /** Hide the number shown beside the label. */
  hideValue?: boolean;
  className?: string;
}

/** The Balatro settings slider: a red fill in a dark well, value read out beside the label. */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  { label, tone = 'red', hideValue, className, ...rest },
  ref,
) {
  return (
    <BaseSlider.Root ref={ref} {...rest} className={cx('j-slider', className)} data-tone={tone}>
      <div className="j-slider__head">
        <BaseSlider.Label className="j-slider__label">{label}</BaseSlider.Label>
        {!hideValue && <BaseSlider.Value className="j-slider__value" />}
      </div>
      <BaseSlider.Control className="j-slider__control">
        <BaseSlider.Track className="j-slider__track">
          <BaseSlider.Indicator className="j-slider__fill" />
          <BaseSlider.Thumb className="j-slider__thumb" />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
});
