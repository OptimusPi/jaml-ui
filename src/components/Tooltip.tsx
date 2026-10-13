import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ReactElement, ReactNode } from 'react';

export interface TooltipProps {
  /** What the tooltip says. */
  content: ReactNode;
  /** The element that shows the tooltip on hover and focus. Must accept a ref and props. */
  children: ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** ms before it opens on hover. */
  delay?: number;
  /** Controlled open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** A small Jimbo panel that names or explains the thing under the pointer. */
export function Tooltip({ content, children, side = 'top', delay = 300, open, onOpenChange }: TooltipProps) {
  return (
    <BaseTooltip.Root open={open} onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}>
      <BaseTooltip.Trigger delay={delay} render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={10} className="j-tooltip-positioner">
          <BaseTooltip.Popup className="j-tooltip">
            <BaseTooltip.Arrow className="j-tooltip__arrow" />
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

/** Shares hover delay between neighbouring tooltips, so moving along a toolbar feels instant. */
export const TooltipProvider = BaseTooltip.Provider;
