import type { MarketEventType } from '../types/index.js';

/**
 * Default colors for market event types
 */
export const DEFAULT_EVENT_COLORS: Record<MarketEventType, string> = {
  crash: '#ef4444',
  rally: '#22c55e',
  policy: '#f59e0b',
  crisis: '#dc2626',
  milestone: '#3b82f6',
};

/**
 * Human-readable labels for event types
 */
export const EVENT_TYPE_LABELS: Record<MarketEventType, string> = {
  crash: 'Market Crash',
  rally: 'Market Rally',
  policy: 'Policy Change',
  crisis: 'Crisis Event',
  milestone: 'Milestone',
};
