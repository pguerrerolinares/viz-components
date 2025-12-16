import type { ThemeColors } from '../types/index.js';

/**
 * Update basic Highcharts chart theme via DOM manipulation
 * This preserves layout by avoiding Highcharts API updates for axes
 */
export function updateHighchartsThemeDOM(
  container: HTMLElement,
  theme: ThemeColors,
  isDark: boolean
): void {
  // Background
  const bg = container.querySelector('.highcharts-background');
  if (bg) {
    (bg as SVGElement).setAttribute('fill', theme.background);
  }

  // Axis labels
  container.querySelectorAll('.highcharts-axis-labels text').forEach((el) => {
    (el as SVGElement).style.fill = theme.text;
  });

  // Title and subtitle
  const title = container.querySelector('.highcharts-title');
  if (title) {
    (title as SVGElement).style.fill = theme.text;
  }
  const subtitle = container.querySelector('.highcharts-subtitle');
  if (subtitle) {
    (subtitle as SVGElement).style.fill = theme.text;
  }

  // Legend items
  container.querySelectorAll('.highcharts-legend-item text').forEach((el) => {
    (el as SVGElement).style.fill = theme.text;
  });

  // Axis titles
  container.querySelectorAll('.highcharts-axis-title').forEach((el) => {
    (el as SVGElement).style.fill = theme.text;
  });

  // Data labels
  container.querySelectorAll('.highcharts-data-labels text').forEach((el) => {
    (el as SVGElement).style.fill = theme.text;
  });
}

/**
 * Update Highcharts Stock chart theme via DOM manipulation
 * Includes range selector, navigator, and scrollbar elements
 */
export function updateStockChartThemeDOM(
  container: HTMLElement,
  theme: ThemeColors,
  isDark: boolean
): void {
  // Apply base theme updates
  updateHighchartsThemeDOM(container, theme, isDark);


  // Range selector labels ("From", "To")
  container.querySelectorAll('.highcharts-range-selector-group text').forEach((el) => {
    (el as SVGElement).style.fill = theme.text;
  });

  // Range selector input text
  container.querySelectorAll('.highcharts-range-input text').forEach((el) => {
    (el as SVGElement).style.fill = theme.text;
  });

  // Input group text
  container.querySelectorAll('.highcharts-input-group text').forEach((el) => {
    (el as SVGElement).style.fill = theme.text;
  });

  // Navigator mask
  const navigatorMask = container.querySelector('.highcharts-navigator-mask-inside');
  if (navigatorMask) {
    (navigatorMask as SVGElement).setAttribute('fill', `${theme.primary}20`);
  }

  // Navigator handles
  container.querySelectorAll('.highcharts-navigator-handle').forEach((el) => {
    (el as SVGElement).setAttribute('fill', isDark ? '#333' : '#f2f2f2');
  });

  // Scrollbar thumb
  container.querySelectorAll('.highcharts-scrollbar-thumb').forEach((el) => {
    (el as SVGElement).setAttribute(
      'fill',
      isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'
    );
  });

  // Scrollbar track
  const scrollbarTrack = container.querySelector('.highcharts-scrollbar-track');
  if (scrollbarTrack) {
    (scrollbarTrack as SVGElement).setAttribute('fill', 'transparent');
  }
}
