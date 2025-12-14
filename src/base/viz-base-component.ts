import { LitElement, css } from 'lit';
import { property, state } from 'lit/decorators.js';
import type { ThemeColors } from '../types/index.js';

/**
 * Base class for all viz-components
 * Provides common functionality like theme handling, loading states, and error handling
 */
export class VizBaseComponent extends LitElement {
  /**
   * Loading state
   */
  @state()
  protected loading = false;

  /**
   * Error message
   */
  @state()
  protected error: string | null = null;

  /**
   * Whether to use theme from CSS custom properties
   */
  @property({ type: Boolean })
  theme = true;

  /**
   * Base styles shared across all components
   */
  static override styles = css`
    :host {
      display: block;
      box-sizing: border-box;
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
      color: var(--viz-text, #333);
    }

    .error {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      padding: 1rem;
      color: var(--viz-error, #d32f2f);
      background: var(--viz-error-bg, #ffebee);
      border-radius: var(--viz-radius, 8px);
    }
  `;

  /**
   * Get theme colors from CSS custom properties
   */
  protected getThemeColors(): ThemeColors {
    const root = getComputedStyle(document.documentElement);

    return {
      primary: root.getPropertyValue('--viz-primary').trim() || '#0071e3',
      background: root.getPropertyValue('--viz-bg').trim() || '#ffffff',
      text: root.getPropertyValue('--viz-text').trim() || '#000000',
      palette: [
        root.getPropertyValue('--viz-primary').trim() || '#0071e3',
        root.getPropertyValue('--viz-accent-purple').trim() || '#9c27b0',
        root.getPropertyValue('--viz-accent-cyan').trim() || '#00bcd4',
        root.getPropertyValue('--viz-accent-pink').trim() || '#e91e63',
        root.getPropertyValue('--viz-category-web').trim() || '#2196f3',
        root.getPropertyValue('--viz-category-ai').trim() || '#ff9800',
      ],
    };
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
   * Clear error state
   */
  protected clearError(): void {
    this.error = null;
  }

  /**
   * Set loading state
   */
  protected setLoading(loading: boolean): void {
    this.loading = loading;
    if (loading) {
      this.clearError();
    }
  }
}
