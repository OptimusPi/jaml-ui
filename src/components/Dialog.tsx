import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ReactElement, ReactNode } from 'react';
import type { Tone } from '../tokens.ts';
import { Button } from './Button.tsx';

export interface DialogProps {
  title: ReactNode;
  /** One line under the title, read out when the dialog opens. */
  description?: ReactNode;
  children?: ReactNode;
  /** Element that opens the dialog, usually a Button. Omit when controlling `open` yourself. */
  trigger?: ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Label of the close button. @default 'Back' */
  backLabel?: ReactNode;
  /** @default 'orange' */
  backTone?: Tone;
  /** Extra actions shown above the Back button. */
  actions?: ReactNode;
}

export function Dialog({
  title,
  description,
  children,
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  backLabel = 'Back',
  backTone = 'orange',
  actions,
}: DialogProps) {
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange ? (next) => onOpenChange(next) : undefined}
    >
      {trigger && <BaseDialog.Trigger render={trigger} />}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="j-dialog__backdrop" />
        <BaseDialog.Popup className="j-dialog">
          <BaseDialog.Title className="j-dialog__title">{title}</BaseDialog.Title>
          {description != null && (
            <BaseDialog.Description className="j-dialog__description">{description}</BaseDialog.Description>
          )}
          {children != null && <div className="j-dialog__body">{children}</div>}
          <div className="j-dialog__actions">
            {actions}
            <BaseDialog.Close render={<Button tone={backTone} block />}>{backLabel}</BaseDialog.Close>
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
