/**
 * Shared styles for micro components (viz-sparkline, viz-kpi, viz-status)
 */

import { css } from 'lit';

/**
 * Status colors for semantic indicators
 */
export const statusColors = {
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  neutral: '#6b7280',
} as const;

/**
 * Trend colors for up/down indicators
 */
export const trendColors = {
  up: '#22c55e',
  down: '#ef4444',
  neutral: '#6b7280',
} as const;

/**
 * Size configurations for components
 */
export const sizeConfig = {
  small: {
    fontSize: '0.75rem',
    valueFontSize: '1.25rem',
    padding: '0.5rem',
    gap: '0.25rem',
    iconSize: '14px',
    sparklineHeight: 24,
  },
  medium: {
    fontSize: '0.875rem',
    valueFontSize: '1.75rem',
    padding: '0.75rem',
    gap: '0.5rem',
    iconSize: '18px',
    sparklineHeight: 32,
  },
  large: {
    fontSize: '1rem',
    valueFontSize: '2.5rem',
    padding: '1rem',
    gap: '0.75rem',
    iconSize: '24px',
    sparklineHeight: 48,
  },
} as const;

/**
 * Shared micro component styles
 */
export const microSharedStyles = css`
  /* Size variants */
  :host([size='small']) {
    --_micro-font-size: 0.75rem;
    --_micro-value-font-size: 1.25rem;
    --_micro-padding: 0.5rem;
    --_micro-gap: 0.25rem;
    --_micro-icon-size: 14px;
  }

  :host([size='medium']),
  :host(:not([size])) {
    --_micro-font-size: 0.875rem;
    --_micro-value-font-size: 1.75rem;
    --_micro-padding: 0.75rem;
    --_micro-gap: 0.5rem;
    --_micro-icon-size: 18px;
  }

  :host([size='large']) {
    --_micro-font-size: 1rem;
    --_micro-value-font-size: 2.5rem;
    --_micro-padding: 1rem;
    --_micro-gap: 0.75rem;
    --_micro-icon-size: 24px;
  }

  /* Trend colors */
  .trend-up,
  .up {
    color: #22c55e;
  }

  .trend-down,
  .down {
    color: #ef4444;
  }

  .trend-neutral,
  .neutral {
    color: #6b7280;
  }

  /* Status backgrounds */
  .bg-success {
    background-color: rgba(34, 197, 94, 0.1);
  }

  .bg-warning {
    background-color: rgba(245, 158, 11, 0.1);
  }

  .bg-error {
    background-color: rgba(239, 68, 68, 0.1);
  }

  .bg-info {
    background-color: rgba(59, 130, 246, 0.1);
  }

  .bg-neutral {
    background-color: rgba(107, 114, 128, 0.1);
  }

  /* Pulse animation */
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* Fade in animation */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-in {
    animation: fadeIn 0.3s ease-out;
  }
`;

/**
 * Status icons - all centered at (12,12), same visual weight, consistent stroke
 * Each icon spans roughly 12 units and is centered in the 24x24 viewBox
 */
export const statusIcons = {
  // Checkmark: centered, spans 12x9
  success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 12 10 16 18 8"/></svg>`,
  // Exclamation: vertical line + dot, centered
  warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="6" x2="12" y2="14"/><circle cx="12" cy="18" r="0.5" fill="currentColor"/></svg>`,
  // X mark: centered, spans 12x12
  error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>`,
  // Info: dot + vertical line, centered (inverted from warning)
  info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="0.5" fill="currentColor"/><line x1="12" y1="10" x2="12" y2="18"/></svg>`,
  // Minus/dash: horizontal line, centered
  neutral: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="18" y2="12"/></svg>`,
} as const;

/**
 * Trend arrow icons - centered, same visual weight as status icons
 */
export const trendIcons = {
  // Chevron up: centered, spans 12x6
  up: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 15 12 9 18 15"/></svg>`,
  // Chevron down: centered, spans 12x6
  down: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
} as const;
