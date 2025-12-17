import { property } from 'lit/decorators.js';
import { createRef, Ref } from 'lit/directives/ref.js';
import type Highcharts from 'highcharts/highstock';
import { VizBaseComponent } from './viz-base-component.js';
import { updateHighchartsThemeDOM } from '../utils/highcharts-theme.js';

/**
 * Base class for Highcharts-based components
 * Provides common lifecycle, theme handling, and chart management
 */
export abstract class VizHighchartsComponent extends VizBaseComponent {
  /** Enable demo mode with sample data */
  @property({ type: Boolean })
  demo = false;

  /** Highcharts chart instance */
  protected chart: Highcharts.Chart | null = null;

  /** Reference to chart container element */
  protected containerRef: Ref<HTMLDivElement> = createRef();

  /**
   * Load demo data - implement in subclasses
   */
  protected abstract loadDemoData(): void;

  /**
   * Create or update the chart - implement in subclasses
   */
  protected abstract updateChart(): void;

  /**
   * Get list of properties that should trigger chart update
   */
  protected abstract getWatchedProperties(): string[];

  override connectedCallback(): void {
    super.connectedCallback();
    this.setupThemeObserver();
    if (this.demo) {
      this.loadDemoData();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.destroyChart();
    this.cleanupThemeObserver();
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    // Load demo data if demo prop changed and no data present
    if (changedProperties.has('demo') && this.demo) {
      this.loadDemoData();
    }

    // Check if chart needs update based on watched properties
    const watchedProps = this.getWatchedProperties();
    const needsUpdate =
      !this.chart || watchedProps.some((prop) => changedProperties.has(prop));

    if (needsUpdate) {
      this.updateChart();
    }
  }

  /**
   * Destroy the chart instance safely
   */
  protected destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  /**
   * Default theme update for basic charts (non-stock)
   * Uses DOM manipulation to update colors without full chart rebuild
   */
  protected override updateTheme(): void {
    if (!this.chart) return;

    const theme = this.getThemeColors();
    const isDark = theme.background !== '#ffffff';

    // Update chart background and tooltip via Highcharts API
    this.chart.update(
      {
        chart: {
          backgroundColor: theme.background,
        },
        tooltip: {
          backgroundColor: theme.background,
          style: { color: theme.text },
        },
      },
      false,
      false,
      false
    );

    this.chart.redraw(false);

    // Update other colors via DOM manipulation to preserve layout
    const container = this.containerRef.value;
    if (!container) return;

    updateHighchartsThemeDOM(container, theme, isDark);
  }

  /**
   * Check if data is empty - useful for conditional rendering
   */
  protected hasData(): boolean {
    return true; // Override in subclasses with specific data checks
  }
}
