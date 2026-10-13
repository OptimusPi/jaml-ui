import { Field } from '@base-ui/react/field';
import { Input } from '@base-ui/react/input';
import { forwardRef, type ReactNode } from 'react';
import { cx } from '../utils/cx.ts';

export interface TextFieldProps extends Omit<Input.Props, 'className' | 'children'> {
  label: ReactNode;
  /** Help text under the input. */
  description?: ReactNode;
  /** When set, the field is marked invalid and this message is shown and announced. */
  error?: ReactNode;
  /** Use the code font (seeds, JAML snippets). */
  mono?: boolean;
  className?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, description, error, mono, className, disabled, ...rest },
  ref,
) {
  const invalid = error != null && error !== false;
  return (
    <Field.Root className={cx('j-field', className)} invalid={invalid} disabled={disabled}>
      <Field.Label className="j-field__label">{label}</Field.Label>
      <Input ref={ref} {...rest} className="j-input" data-mono={mono || undefined} />
      {description != null && <Field.Description className="j-field__description">{description}</Field.Description>}
      {invalid && (
        <Field.Error className="j-field__error" match>
          {error}
        </Field.Error>
      )}
    </Field.Root>
  );
});
