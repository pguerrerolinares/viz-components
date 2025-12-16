import { LitElement, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { ThemeColors } from '../types/index.js';

/**
 * Base class for all viz-components
 * Provides theme handling, loading states, and common styles
 */
export class VizBaseComponent extends LitElement {
  /** Theme mode: 'light', 'dark', or 'auto' (detects from parent) */
  @property({ type: String })
  theme: 'light' | 'dark' | 'auto' = 'auto';

  @state()
  protected loading = false;

  @state()
  protected error: string | null = null;

  /** MutationObserver for detecting theme changes */
  protected themeObserver: MutationObserver | null = null;

  /** Debounce timer for theme updates */
  private themeDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  static override styles = [css`
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
  `];

  /**
   * Get theme colors from CSS custom properties
   */
  protected getThemeColors(): ThemeColors {
    const root = getComputedStyle(document.documentElement);

    return {
      primary: root.getPropertyValue('--viz-primary').trim() || '#0071e3',
      background: root.getPropertyValue('--viz-bg').trim() || '#ffffff',
      text: root.getPropertyValue('--viz-text').trim() || '#1d1d1f',
      palette: [
        root.getPropertyValue('--viz-primary').trim() || '#0071e3',
        root.getPropertyValue('--viz-accent-purple').trim() || '#6366f1',
        root.getPropertyValue('--viz-accent-cyan').trim() || '#0d9488',
        root.getPropertyValue('--viz-accent-pink').trim() || '#ec4899',
        root.getPropertyValue('--viz-category-web').trim() || '#3b82f6',
        root.getPropertyValue('--viz-category-ai').trim() || '#8b5cf6',
      ],
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
   * Setup theme observer for auto theme detection
   * Watches document.documentElement and document.body for class changes
   * Call this in connectedCallback() of subclasses that need theme auto-detection
   */
  protected setupThemeObserver(): void {
    if (this.theme !== 'auto') return;

    this.themeObserver = new MutationObserver(() => {
      // Debounce rapid theme toggles
      if (this.themeDebounceTimer) {
        clearTimeout(this.themeDebounceTimer);
      }
      this.themeDebounceTimer = setTimeout(() => {
        this.updateTheme();
      }, 50);
    });

    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    this.themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  /**
   * Cleanup theme observer and debounce timer
   * Call this in disconnectedCallback() of subclasses
   */
  protected cleanupThemeObserver(): void {
    if (this.themeDebounceTimer) {
      clearTimeout(this.themeDebounceTimer);
      this.themeDebounceTimer = null;
    }
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }
  }

  /**
   * Update theme colors - override in subclasses
   * Called when theme changes are detected via MutationObserver
   */
  protected updateTheme(): void {
    // Override in subclasses to handle theme updates
  }

  /**
   * Check if dark mode is currently active
   * Considers explicit theme property or auto-detection from document classes
   */
  protected isDarkMode(): boolean {
    return (
      this.theme === 'dark' ||
      (this.theme === 'auto' &&
        (document.documentElement.classList.contains('dark') ||
          document.body.classList.contains('dark')))
    );
  }

  /**
   * Get primary color based on current theme
   * Returns appropriate accent color for light or dark mode
   */
  protected getPrimaryColor(): string {
    return this.isDarkMode() ? '#0a84ff' : '#0071e3';
  }

  /**
   * Apply Highcharts theme class to a container element
   * Sets highcharts-dark or highcharts-light class based on current theme
   */
  protected applyHighchartsThemeClass(container: HTMLElement): void {
    const isDark = this.isDarkMode();
    container.classList.toggle('highcharts-dark', isDark);
    container.classList.toggle('highcharts-light', !isDark);
  }
}
