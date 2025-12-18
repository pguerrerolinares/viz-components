/**
 * Highcharts-specific theme utilities
 * Extracted from base components to keep core framework-agnostic
 */

import type { CoreThemeColors } from '../core/theme.js';

// Re-export DOM theme utilities from utils
export {
  updateHighchartsThemeDOM,
  updateStockChartThemeDOM,
} from '../utils/highcharts-theme.js';

/**
 * Apply Highcharts adaptive theme class to a container element
 * Sets highcharts-dark or highcharts-light class based on current theme
 *
 * This works with Highcharts adaptive theme which uses CSS custom properties.
 * The class on the container allows CSS to override the `:root` level styles.
 */
export function applyHighchartsThemeClass(
  container: HTMLElement,
  isDark: boolean
): void {
  container.classList.toggle('highcharts-dark', isDark);
  container.classList.toggle('highcharts-light', !isDark);
}

/**
 * Get Highcharts-compatible color palette from core theme colors
 * Primary color first, followed by accent colors
 */
export function getHighchartsPalette(theme: CoreThemeColors): string[] {
  return [theme.primary, ...theme.accent];
}

/**
 * Get primary color adjusted for dark/light mode
 * Uses slightly brighter primary in dark mode for visibility
 */
export function getThemePrimaryColor(isDark: boolean): string {
  return isDark ? '#0a84ff' : '#0071e3';
}
