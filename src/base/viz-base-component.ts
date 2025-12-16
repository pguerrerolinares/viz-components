import { LitElement, css } from 'lit';
import { state } from 'lit/decorators.js';
import type { ThemeColors } from '../types/index.js';

/**
 * Base class for all viz-components
 * Provides theme handling, loading states, and common styles
 */
export class VizBaseComponent extends LitElement {
  @state()
  protected loading = false;

  @state()
  protected error: string | null = null;

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
}
