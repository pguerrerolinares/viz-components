/**
 * Base class for all viz-components
 * Provides theme handling, loading states, event emission, and common styles
 *
 * NO Highcharts-specific code - that lives in VizHighchartsComponent
 */

import { LitElement, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import {
  ThemeController,
  readThemeColors,
  readThemePalette,
  type ThemeState,
  type CoreThemeColors,
} from '../core/theme.js';
import { emitVizEvent } from '../core/events.js';
import { VizEventNames } from '../types/events.js';
import type { ThemeColors } from '../types/index.js';

export class VizBaseComponent extends LitElement {
  /** Theme mode: 'light', 'dark', or 'auto' (detects from parent) */
  @property({ type: String })
  theme: 'light' | 'dark' | 'auto' = 'auto';

  @state()
  protected loading = false;

  @state()
  protected error: string | null = null;

  /** Theme controller - handles detection and changes */
  protected themeController = new ThemeController(this, {
    onThemeChange: (state) => this.onThemeChange(state),
  });

  static override styles = [
    css`
      :host {
        display: block;
        box-sizing: border-box;
        --_bg: var(--viz-bg, #ffffff);
        --_text: var(--viz-text, #1d1d1f);
        --_primary: var(--viz-primary, #0071e3);
        --_radius: var(--viz-radius, 16px);
      }

      *,
      *::before,
      *::after {
        box-sizing: inherit;
      }

      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        color: var(--_text);
      }

      .error {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        padding: 1rem;
        color: #d32f2f;
        background: #ffebee;
        border-radius: var(--_radius);
      }
    `,
  ];

  /**
   * Get core theme colors from CSS custom properties
   */
  protected getCoreThemeColors(): CoreThemeColors {
    return readThemeColors();
  }

  /**
   * Get theme colors from CSS custom properties
   * Includes palette for backward compatibility
   */
  protected getThemeColors(): ThemeColors {
    const core = readThemeColors();
    return {
      ...core,
      palette: readThemePalette(),
    };
  }

  /**
   * Set loading state
   */
  protected setLoading(loading: boolean): void {
    this.loading = loading;
    if (loading) {
      this.error = null;
    }
  }

  /**
   * Handle errors
   */
  protected handleError(error: unknown): void {
    console.error('[VizComponent]', error);
    this.error = error instanceof Error ? error.message : String(error);
    this.loading = false;
  }

  /**
   * Check if dark mode is currently active
   */
  protected isDarkMode(): boolean {
    return this.themeController.isDark;
  }

  /**
   * Get primary color based on current theme
   */
  protected getPrimaryColor(): string {
    return this.isDarkMode() ? '#0a84ff' : '#0071e3';
  }

  /**
   * Handle theme changes - override in subclasses for custom behavior
   * Emits viz-theme-change event by default
   */
  protected onThemeChange(state: ThemeState): void {
    this.emitEvent(VizEventNames.THEME_CHANGE, {
      mode: state.current,
      auto: state.isAuto,
    });
  }

  /**
   * Emit a standardized viz-component event
   */
  protected emitEvent<T>(eventName: string, data: T): boolean {
    return emitVizEvent(this, eventName, data);
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    // Sync theme property with controller
    if (changedProperties.has('theme')) {
      this.themeController.setMode(this.theme);
    }
  }
}
