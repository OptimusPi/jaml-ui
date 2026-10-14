import { Select as BaseSelect } from '@base-ui/react/select';
import type { ReactNode } from 'react';
import { cx } from '../utils/cx.ts';

export interface SelectItem<T extends string | number> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectProps<T extends string | number> {
  label: ReactNode;
  items: readonly SelectItem<T>[];
  value?: T | null;
  defaultValue?: T | null;
  onValueChange?: (value: T | null) => void;
  /** Shown when nothing is chosen. */
  placeholder?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  /** Form field name. */
  name?: string;
  className?: string;
}

/** A dropdown list in a Jimbo panel. For a handful of options you step through, use Cycle. */
export function Select<T extends string | number>({
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  placeholder = 'Choose…',
  disabled,
  required,
  name,
  className,
}: SelectProps<T>) {
  return (
    <BaseSelect.Root<T>
      items={items.map((i) => ({ value: i.value, label: i.label }))}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (next) => onValueChange(next as T | null) : undefined}
      disabled={disabled}
      required={required}
      name={name}
    >
      <div className={cx('j-select', className)}>
        <BaseSelect.Label className="j-field__label">{label}</BaseSelect.Label>
        <BaseSelect.Trigger className="j-select__trigger">
          <BaseSelect.Value className="j-select__value" placeholder={placeholder} />
          <BaseSelect.Icon className="j-select__icon">▼</BaseSelect.Icon>
        </BaseSelect.Trigger>
      </div>
      <BaseSelect.Portal>
        <BaseSelect.Positioner className="j-select-positioner" sideOffset={6} alignItemWithTrigger={false}>
          <BaseSelect.Popup className="j-select__popup">
            <BaseSelect.List className="j-select__list">
              {items.map((item) => (
                <BaseSelect.Item
                  key={String(item.value)}
                  value={item.value}
                  disabled={item.disabled}
                  className="j-select__item"
                >
                  <BaseSelect.ItemIndicator className="j-select__check">✓</BaseSelect.ItemIndicator>
                  <BaseSelect.ItemText className="j-select__text">{item.label}</BaseSelect.ItemText>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
