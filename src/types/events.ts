/**
 * Event type definitions for viz-components
 * Standardized event structure across all components
 */

/**
 * Base event detail structure for all viz-components
 */
export interface VizEventDetail<T = unknown> {
  /** Component tag name that emitted the event */
  source: string;
  /** Timestamp when event occurred */
  timestamp: number;
  /** Event-specific payload */
  data: T;
}

/**
 * Typed custom event wrapper
 */
export type VizCustomEvent<T = unknown> = CustomEvent<VizEventDetail<T>>;

// ============================================================================
// Chart Events
// ============================================================================

export interface PointClickData {
  seriesIndex: number;
  pointIndex: number;
  value: unknown;
  category?: string;
}

export interface SeriesClickData {
  seriesIndex: number;
  seriesName: string;
}

export interface ZoomData {
  min: number;
  max: number;
  type: 'x' | 'y' | 'xy';
}

export interface LegendToggleData {
  seriesIndex: number;
  seriesName: string;
  visible: boolean;
}

// ============================================================================
// Table Events
// ============================================================================

export interface SortData {
  column: string;
  direction: 'asc' | 'desc';
}

export interface FilterData {
  value: string;
  column?: string;
}

export interface SelectData<T = unknown> {
  rows: T[];
  indices: number[];
}

export interface PageData {
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Widget Events
// ============================================================================

export interface ExpandData {
  expanded: boolean;
}

export interface RefreshData {
  timestamp: number;
}

// ============================================================================
// Theme Events
// ============================================================================

export interface ThemeChangeData {
  mode: 'light' | 'dark';
  auto: boolean;
}

// ============================================================================
// Store Events
// ============================================================================

// Re-export from store types for convenience
export type { StateChangeData } from './store.js';

// ============================================================================
// Event Name Constants
// ============================================================================

export const VizEventNames = {
  // Chart events
  POINT_CLICK: 'viz-point-click',
  SERIES_CLICK: 'viz-series-click',
  ZOOM: 'viz-zoom',
  LEGEND_TOGGLE: 'viz-legend-toggle',

  // Table events
  SORT: 'viz-sort',
  FILTER: 'viz-filter',
  SELECT: 'viz-select',
  PAGE: 'viz-page',

  // Widget events
  EXPAND: 'viz-expand',
  REFRESH: 'viz-refresh',

  // Theme events
  THEME_CHANGE: 'viz-theme-change',

  // Store events
  STATE_CHANGE: 'viz-state-change',
} as const;

export type VizEventName = (typeof VizEventNames)[keyof typeof VizEventNames];
