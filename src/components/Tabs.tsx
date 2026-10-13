import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { createContext, forwardRef, useContext, type ReactNode } from 'react';
import type { Tone } from '../tokens.ts';
import { cx } from '../utils/cx.ts';
import type { ButtonSize } from './Button.tsx';

interface TabsLook {
  tone: Tone;
  size: ButtonSize;
}
const TabsLookContext = createContext<TabsLook>({ tone: 'red', size: 'sm' });

export interface TabsProps extends Omit<BaseTabs.Root.Props, 'className'> {
  /** Tone of every tab button and the arrow. @default 'red' */
  tone?: Tone;
  /** @default 'sm' */
  size?: ButtonSize;
  className?: string;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { tone = 'red', size = 'sm', className, ...rest },
  ref,
) {
  return (
    <TabsLookContext.Provider value={{ tone, size }}>
      <BaseTabs.Root ref={ref} {...rest} className={cx('j-tabs', className)} data-tone={tone} />
    </TabsLookContext.Provider>
  );
});

export interface TabListProps extends Omit<BaseTabs.List.Props, 'className'> {
  className?: string;
}

export const TabList = forwardRef<HTMLDivElement, TabListProps>(function TabList(
  { className, children, ...rest },
  ref,
) {
  return (
    <BaseTabs.List ref={ref} {...rest} className={cx('j-tabs__list', className)}>
      {children}
      <BaseTabs.Indicator className="j-tabs__indicator" renderBeforeHydration>
        <span className="j-tabs__arrow" aria-hidden="true" />
      </BaseTabs.Indicator>
    </BaseTabs.List>
  );
});

export interface TabProps extends Omit<BaseTabs.Tab.Props, 'className' | 'children'> {
  children?: ReactNode;
  className?: string;
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab({ className, children, ...rest }, ref) {
  const { tone, size } = useContext(TabsLookContext);
  return (
    <BaseTabs.Tab
      ref={ref}
      {...rest}
      className={cx('j-button', 'j-tabs__tab', className)}
      data-tone={tone}
      data-size={size}
    >
      <span className="j-button__face">{children}</span>
    </BaseTabs.Tab>
  );
});

export interface TabPanelProps extends Omit<BaseTabs.Panel.Props, 'className'> {
  className?: string;
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel({ className, ...rest }, ref) {
  return <BaseTabs.Panel ref={ref} {...rest} className={cx('j-tabs__panel', className)} />;
});
