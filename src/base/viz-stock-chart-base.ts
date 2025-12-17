import { state } from 'lit/decorators.js';
import type Highcharts from 'highcharts/highstock';
import { VizHighchartsComponent } from './viz-highcharts-component.js';

/**
 * Change info for price display
 */
export interface ChangeInfo {
  change: number;
  percent: number;
  direction: 'up' | 'down';
}

/**
 * Base class for stock chart components
 * Provides specialized theme handling for Highcharts Stock charts
 * with zoom state preservation and range selector management
 */
export abstract class VizStockChartBase extends VizHighchartsComponent {
  /** Cached change info for header display */
  @state()
  protected cachedChangeInfo: ChangeInfo = { change: 0, percent: 0, direction: 'up' };

  /** Last price for header display */
  protected lastPrice = 0;

  /**
   * Apply Highcharts theme class to container and update chart
   * Preserves zoom state when updating
   */
  protected override updateTheme(): void {
    const container = this.containerRef.value;
    if (!container) return;

    // Apply theme class for CSS custom properties
    this.applyHighchartsThemeClass(container);

    if (this.chart) {
      const primaryColor = this.getPrimaryColor();

      // Save zoom state before update
      const xAxis = this.chart.xAxis[0];
      const extremes = xAxis?.getExtremes();

      // Update range selector button theme
      this.chart.update(
        {
          rangeSelector: {
            buttonTheme: {
              states: {
                hover: { fill: primaryColor, style: { color: '#ffffff' } },
                select: { fill: primaryColor, style: { color: '#ffffff', fontWeight: 'bold' } },
              },
            },
          },
        },
        false,
        false,
        false
      );

      // Restore zoom state with redraw
      if (xAxis && extremes?.userMin !== undefined) {
        xAxis.setExtremes(extremes.userMin, extremes.userMax, true, false);
      } else {
        this.chart.redraw();
      }
    }
  }

  /**
   * Preserve extremes during chart update
   * Use this wrapper when updating chart to maintain zoom state
   */
  protected preserveExtremesAndUpdate(updateFn: () => void): void {
    if (!this.chart) {
      updateFn();
      return;
    }

    const xAxis = this.chart.xAxis[0];
    const extremes = xAxis?.getExtremes();

    updateFn();

    if (xAxis && extremes?.userMin !== undefined) {
      xAxis.setExtremes(extremes.userMin, extremes.userMax, true, false);
    }
  }

  /**
   * Calculate price change info
   */
  protected calculateChange(current: number, previous: number): ChangeInfo {
    if (!previous) {
      return { change: 0, percent: 0, direction: 'up' };
    }
    const change = current - previous;
    const percent = (change / previous) * 100;
    return { change, percent, direction: change >= 0 ? 'up' : 'down' };
  }

  /**
   * Build range selector button theme with primary color
   */
  protected buildRangeSelectorButtonTheme(): Highcharts.SVGAttributes {
    const primaryColor = this.getPrimaryColor();
    return {
      fill: 'transparent',
      'stroke-width': 1,
      r: 4,
      states: {
        hover: { fill: primaryColor, style: { color: '#ffffff' } },
        select: { fill: primaryColor, style: { color: '#ffffff', fontWeight: 'bold' } },
      },
    };
  }

  /**
   * Build standard range selector buttons for intraday/short-term
   */
  protected buildShortTermButtons(): Highcharts.RangeSelectorButtonsOptions[] {
    return [
      { type: 'hour', count: 1, text: '1H' },
      { type: 'day', count: 1, text: '1D' },
      { type: 'week', count: 1, text: '1W' },
      { type: 'month', count: 1, text: '1M' },
      { type: 'month', count: 3, text: '3M' },
      { type: 'year', count: 1, text: '1Y' },
      { type: 'all', text: 'All' },
    ];
  }

  /**
   * Build range selector buttons for long-term historical data
   */
  protected buildLongTermButtons(): Highcharts.RangeSelectorButtonsOptions[] {
    return [
      { type: 'year', count: 1, text: '1Y' },
      { type: 'year', count: 5, text: '5Y' },
      { type: 'year', count: 10, text: '10Y' },
      { type: 'year', count: 20, text: '20Y' },
      { type: 'all', text: 'All' },
    ];
  }
}
