/**
 * Lazy initialization controller for viz-components
 * Defers heavy rendering until component is visible in viewport
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit';

// ============================================================================
// Types
// ============================================================================

export interface LazyInitOptions {
  /** Root element for intersection (default: null = viewport) */
  root?: Element | null;
  /** Margin around root (default: '100px') - preload before fully visible */
  rootMargin?: string;
  /** Visibility threshold to trigger (default: 0) */
  threshold?: number | number[];
  /** Callback when element becomes visible */
  onVisible: () => void;
  /** Callback when element leaves viewport (optional) */
  onHidden?: () => void;
}

// ============================================================================
// Lazy Init Controller
// ============================================================================

/**
 * Controller for lazy initialization using IntersectionObserver
 * Defers heavy work (chart rendering) until component is visible
 *
 * @example
 * ```typescript
 * class MyChart extends LitElement {
 *   private lazy = new LazyInitController(this, {
 *     onVisible: () => this.initChart(),
 *     rootMargin: '50px'
 *   });
 *
 *   protected override render() {
 *     if (!this.lazy.hasBeenVisible) {
 *       return html`<div class="placeholder">Loading...</div>`;
 *     }
 *     return html`<div class="chart-container"></div>`;
 *   }
 * }
 * ```
 */
export class LazyInitController implements ReactiveController {
  private host: ReactiveControllerHost & Element;
  private options: LazyInitOptions;
  private observer: IntersectionObserver | null = null;
  private _isVisible = false;
  private _hasBeenVisible = false;

  constructor(
    host: ReactiveControllerHost & Element,
    options: LazyInitOptions
  ) {
    this.host = host;
    this.options = options;
    host.addController(this);
  }

  /** Whether element is currently visible in viewport */
  get isVisible(): boolean {
    return this._isVisible;
  }

  /** Whether element has ever been visible (for one-time init) */
  get hasBeenVisible(): boolean {
    return this._hasBeenVisible;
  }

  hostConnected(): void {
    // Check for IntersectionObserver support
    if (!('IntersectionObserver' in window)) {
      // Fallback: immediately visible for older browsers
      this._isVisible = true;
      this._hasBeenVisible = true;
      this.options.onVisible();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        root: this.options.root ?? null,
        rootMargin: this.options.rootMargin ?? '100px',
        threshold: this.options.threshold ?? 0,
      }
    );

    this.observer.observe(this.host);
  }

  hostDisconnected(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    const entry = entries[0];
    if (!entry) return;

    const wasVisible = this._isVisible;
    this._isVisible = entry.isIntersecting;

    if (this._isVisible && !wasVisible) {
      // Became visible
      this._hasBeenVisible = true;
      this.options.onVisible();
      // Defer requestUpdate to avoid scheduling during update cycle
      queueMicrotask(() => this.host.requestUpdate());
    } else if (!this._isVisible && wasVisible && this.options.onHidden) {
      // Left viewport
      this.options.onHidden();
    }
  }

  /**
   * Force initialization immediately (bypass lazy loading)
   * Useful for programmatic activation
   */
  forceVisible(): void {
    if (!this._hasBeenVisible) {
      this._isVisible = true;
      this._hasBeenVisible = true;
      this.options.onVisible();
      // Defer requestUpdate to avoid scheduling during update cycle
      queueMicrotask(() => this.host.requestUpdate());
    }
  }

  /**
   * Reset the controller state (for reinitialization)
   */
  reset(): void {
    this._isVisible = false;
    this._hasBeenVisible = false;
    // Defer requestUpdate to avoid scheduling during update cycle
    queueMicrotask(() => this.host.requestUpdate());
  }
}
