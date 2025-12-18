/**
 * Base class for Highcharts-based components
 * Provides chart lifecycle, demo mode, lazy initialization, and theme handling
 */

import { property } from 'lit/decorators.js';
import { createRef, Ref } from 'lit/directives/ref.js';
import type Highcharts from 'highcharts/highstock';
import { VizBaseComponent } from './viz-base-component.js';
import { PropertyWatchController } from '../core/lifecycle.js';
import { LazyInitController } from '../core/lazy.js';
import type { ThemeState } from '../core/theme.js';
import {
  applyHighchartsThemeClass,
  getHighchartsPalette,
  updateHighchartsThemeDOM,
} from './viz-highcharts-theme.js';

/**
 * Abstract base class for all Highcharts-powered components
 * Handles chart lifecycle, property watching, lazy loading, and theming
 */
export abstract class VizHighchartsComponent extends VizBaseComponent {
  /** Enable demo mode with sample data */
  @property({ type: Boolean })
  demo = false;

  /** Enable lazy initialization (default: true) */
  @property({ type: Boolean })
  lazy = true;

  /** Highcharts chart instance */
  protected chart: Highcharts.Chart | null = null;

  /** Reference to chart container element */
  protected containerRef: Ref<HTMLDivElement> = createRef();

  /** Property watch controller - initialized in constructor */
  protected propertyWatcher!: PropertyWatchController;

  /** Lazy init controller - initialized in constructor */
  protected lazyInit!: LazyInitController;

  /** Track if chart has been initialized */
  private _chartInitialized = false;

  constructor() {
    super();

    // Initialize property watcher
    this.propertyWatcher = new PropertyWatchController(this, {
      properties: this.getWatchedProperties(),
      callback: (changed) => this.onWatchedPropertiesChange(changed),
    });

    // Initialize lazy loading controller
    this.lazyInit = new LazyInitController(this, {
      onVisible: () => this.onBecameVisible(),
      rootMargin: '100px',
    });
  }

  /**
   * Get list of properties that should trigger chart update
   * Override in subclasses to specify watched properties
   */
  protected abstract getWatchedProperties(): string[];

  /**
   * Load demo data - implement in subclasses
   */
  protected abstract loadDemoData(): void;

  /**
   * Create or update the chart - implement in subclasses
   */
  protected abstract updateChart(): void;

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.demo) {
      this.loadDemoData();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.destroyChart();
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);

    // Load demo data if demo prop changed
    if (changedProperties.has('demo') && this.demo) {
      this.loadDemoData();
    }

    // Check if lazy loading is disabled and we need immediate init
    if (changedProperties.has('lazy') && !this.lazy && !this._chartInitialized) {
      this.lazyInit.forceVisible();
    }

    // Forward to property watcher
    this.propertyWatcher.checkProperties(changedProperties);
  }

  /**
   * Called when watched properties change
   */
  protected onWatchedPropertiesChange(changed: Map<string, unknown>): void {
    // Only update chart if visible (or not lazy)
    if (!this.lazy || this.lazyInit.hasBeenVisible) {
      if (!this.chart || changed.size > 0) {
        this.updateChart();
        this._chartInitialized = true;
      }
    }
  }

  /**
   * Called when component becomes visible (lazy init)
   */
  protected onBecameVisible(): void {
    if (this.demo && !this.hasData()) {
      this.loadDemoData();
    }
    this.updateChart();
    this._chartInitialized = true;
  }

  /**
   * Handle theme changes - update Highcharts theme
   */
  protected override onThemeChange(state: ThemeState): void {
    super.onThemeChange(state);
    this.updateHighchartsTheme();
  }

  /**
   * Update Highcharts-specific theme elements
   * Override in subclasses for custom behavior (e.g., stock charts)
   */
  protected updateHighchartsTheme(): void {
    const container = this.containerRef.value;
    if (!container) return;

    // Apply theme class for CSS custom properties
    applyHighchartsThemeClass(container, this.isDarkMode());

    if (this.chart) {
      const theme = this.getThemeColors();
      const isDark = this.isDarkMode();

      // Update chart via Highcharts API
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

      // Update remaining elements via DOM manipulation
      updateHighchartsThemeDOM(container, theme, isDark);
    }
  }

  /**
   * Apply Highcharts theme class to container
   * Convenience method for subclasses
   */
  protected applyHighchartsThemeClass(container: HTMLElement): void {
    applyHighchartsThemeClass(container, this.isDarkMode());
  }

  /**
   * Destroy the chart instance safely
   */
  protected destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this._chartInitialized = false;
  }

  /**
   * Check if component has data - override in subclasses
   */
  protected hasData(): boolean {
    return true;
  }

  /**
   * Get Highcharts color palette from theme
   */
  protected getChartPalette(): string[] {
    return getHighchartsPalette(this.getCoreThemeColors());
  }
}
