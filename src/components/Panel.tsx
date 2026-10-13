import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../utils/cx.ts';

export interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Heading shown at the top of the panel. */
  title?: ReactNode;
  /** Heading level for `title`, so the page outline stays correct. @default 2 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** `raised` sits on the page; `inset` is a well inside another panel. @default 'raised' */
  variant?: 'raised' | 'inset';
  /** Render as a different element, e.g. 'section' or 'aside'. @default 'div' */
  as?: 'div' | 'section' | 'aside' | 'article' | 'nav';
}

export const Panel = forwardRef<HTMLElement, PanelProps>(function Panel(
  { title, headingLevel = 2, variant = 'raised', as: Tag = 'div', className, children, ...rest },
  ref,
) {
  const Heading = `h${headingLevel}` as const;
  return (
    <Tag ref={ref as never} {...rest} className={cx('j-panel', className)} data-variant={variant}>
      {title != null && <Heading className="j-panel__title">{title}</Heading>}
      {children}
    </Tag>
  );
});
