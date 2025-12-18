/**
 * Core module exports for viz-components
 * Framework-agnostic utilities for all component types
 */

// Events
export { createVizEvent, emitVizEvent, type EventEmitterHost } from './events.js';

// Theme
export {
  ThemeController,
  getCSSProperty,
  readThemeColors,
  readThemePalette,
  type ThemeMode,
  type ThemeState,
  type ThemeControllerOptions,
  type CoreThemeColors,
} from './theme.js';

// Lifecycle
export {
  PropertyWatchController,
} from './lifecycle.js';

export type { PropertyWatchOptions, LifecycleHooks } from './lifecycle.js';

// Lazy initialization
export { LazyInitController } from './lazy.js';

export type { LazyInitOptions } from './lazy.js';

// Store
export { VizStore } from './store.js';
export { StoreController } from './store-controller.js';
