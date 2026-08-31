"use client";

export * from "./ui/tokens.js";
export { useMotionPreference, type JimboMotionSetting } from "./ui/useMotionPreference.js";
export { JimboButton, type JimboButtonProps } from "./ui/JimboButton.js";
export { JimboTextArea, type JimboTextAreaProps } from "./ui/JimboTextArea.js";
export { JimboPanel, type JimboPanelProps } from "./ui/JimboPanel.js";
export { JimboBackground, type JimboBackgroundConfig } from "./ui/JimboBackground.js";
export { JimboApp, type JimboAppProps, type JimboAppVariant } from "./ui/JimboApp.js";
export { JimboInset, type JimboInsetProps } from "./ui/JimboInset.js";
export { JimboWordmark, type JimboWordmarkProps } from "./ui/JimboWordmark.js";
export {
  JimboSectionHeader,
  type JimboSectionHeaderProps,
  type JimboSectionTone,
} from "./ui/JimboSectionHeader.js";
export {
  JimboText,
  type JimboTextProps,
  type JimboTextSize,
  type JimboTextTone,
} from "./ui/jimboText.js";
export { JimboBadge, type JimboBadgeProps, type JimboBadgeTone } from "./ui/JimboBadge.js";
export { JimboIconButton, type JimboIconButtonProps, type JimboIconButtonTone } from "./ui/JimboIconButton.js";
export {
  JimboStack,
  JimboRow,
  type JimboLayoutProps,
  type JimboRowProps,
  type JimboGap,
  type JimboAlign,
  type JimboJustify,
} from "./ui/JimboLayout.js";
export { JimboGrid, type JimboGridProps } from "./ui/JimboGrid.js";
export { JimboSpacer, type JimboSpacerProps } from "./ui/JimboSpacer.js";
export { JimboDivider, type JimboDividerProps } from "./ui/JimboDivider.js";
export { JimboStatusPill, type JimboStatusPillProps, type JimboStatus } from "./ui/JimboStatusPill.js";
export { JimboErrorBlock, type JimboErrorBlockProps } from "./ui/JimboErrorBlock.js";
export { JimboMascot, type JimboMascotProps } from "./ui/JimboMascot.js";
export {
  JimboOrbitalMenu,
  type JimboOrbitalMenuProps,
  type JimboOrbitalMenuItem,
  type JimboOrbitalTone,
} from "./ui/JimboOrbitalMenu.js";
export {
  useJimboOrbitalMenu,
  createJimboOrbitalStore,
  jimboOrbitalStore,
  ORBITAL_CLOSE_MS,
  ORBITAL_SINK_MS,
  type JimboOrbitalState,
  type JimboOrbitalStore,
  type JimboOrbitalMenuController,
  type UseJimboOrbitalMenuProps,
} from "./ui/orbitalMenuStore.js";
// Pure orbit geometry — no React, no DOM. Exported so a host can size its own
// box (arcPageCapacity) or drive the same lattice from a different renderer.
export {
  layoutOrbitalArc,
  layoutOrbitalEllipse,
  arcPageCapacity,
  clampOrbitRadius,
  estimatePillWidth,
  maxOrbitRadiusForBox,
  minDistanceFromMascotCenter,
  orbitRadiusForCount,
  southButtonWidth,
  ARC_STACK_GAP,
  FULL_CIRCLE_RAD,
  MASCOT_CLEARANCE_GAP,
  MIN_SOUTH_WIDTH,
  PAGE_CONTROL_LIFT,
  PILL_HALF_H,
  SOUTH_ANGLE_RAD,
  SOUTH_EDGE_INSET,
  SOUTH_PILL_OFFSET,
  type OrbitSlot,
  type OrbitMeasure,
} from "./ui/orbitalLayout.js";
export { JimboSeedCopyChip, type JimboSeedCopyChipProps } from "./ui/JimboSeedCopyChip.js";
export { JimboSpinner, type JimboSpinnerProps } from "./ui/JimboSpinner.js";
export { JimboTextInput, type JimboTextInputProps } from "./ui/JimboTextInput.js";
export { JimboInnerPanel, type JimboInnerPanelProps, JimboModal, type JimboModalProps } from "./ui/panel.js";

// Side-effect: design system CSS custom properties + component classes
import "./ui/jimbo.css";
export { JimboOuterTab, type JimboOuterTabProps, type JimboOuterTabTone } from "./ui/JimboOuterTab.js";
export {
  JimboDock,
  type JimboDockProps,
  type JimboDockPane,
  defaultPyramidDock,
  dockActivate,
  type DockNode,
} from "./ui/JimboDock.js";
export { JimboBox, type JimboBoxProps } from "./ui/JimboBox.js";
export { JimboInline, type JimboInlineProps } from "./ui/JimboInline.js";
export { JimboCanvas, type JimboCanvasProps } from "./ui/JimboCanvas.js";
export { JimboLink, type JimboLinkProps } from "./ui/JimboLink.js";

// Storied primitives that never made the barrel — every one of these has a
// Storybook story and shipped inside the bundle, but consumers (and the
// design sync) couldn't import them until now.
export { JimboListItem, type JimboListItemProps } from "./ui/JimboListItem.js";
export {
  JimboInlineEdit,
  type JimboInlineEditProps,
  type JimboInlineEditSize,
  type JimboInlineEditTone,
} from "./ui/JimboInlineEdit.js";
export {
  JimboPicker,
  JimboPickerSection,
  JimboPickerSearch,
  JimboPickerHint,
  JimboPickerGrid,
  type JimboPickerGridProps,
  JimboPickerItem,
  type JimboPickerItemProps,
  JimboPickerPair,
  JimboPickerEmpty,
} from "./ui/JimboPicker.js";
export { JimboCodeSurface, type JimboCodeSurfaceProps } from "./ui/JimboCodeSurface.js";
export { JimboFlankNav, type JimboFlankNavProps } from "./ui/jimboFlankNav.js";
export { JimboTabs, type JimboTabsProps, type JimboTabDef } from "./ui/jimboTabs.js";
export { JimboSprite, type JimboSpriteProps } from "./ui/sprites.js";
export { JimboSwipeDeck, type JimboSwipeDeckProps } from "./ui/JimboSwipeDeck.js";
export { JimboShopBelt, type JimboShopBeltProps } from "./ui/JimboShopBelt.js";
export { type JimboTone } from "./ui/panel.js";
