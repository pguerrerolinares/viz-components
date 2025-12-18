/**
 * Lifecycle management utilities for viz-components
 * Provides property watching decoupled from chart-specific logic
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit';

// ============================================================================
// Types
// ============================================================================

export interface PropertyWatchOptions {
  /** Properties that trigger the callback when changed */
  properties: string[];
  /** Callback when any watched property changes */
  callback: (changed: Map<string, unknown>) => void;
  /** Debounce time in ms (default: 0) */
  debounce?: number;
}

export interface LifecycleHooks {
  /** Called after first render, before any updates */
  onInitialized?(): void;
  /** Called when component becomes visible (if lazy) */
  onBecameVisible?(): void;
  /** Called before component disconnects */
  onCleanup?(): void;
}

// ============================================================================
// Property Watch Controller
// ============================================================================

/**
 * Controller for watching property changes and triggering callbacks
 * Decoupled from any specific rendering library (Highcharts, etc.)
 *
 * @example
 * ```typescript
 * class MyComponent extends LitElement {
 *   private watcher = new PropertyWatchController(this, {
 *     properties: ['data', 'config'],
 *     callback: (changed) => this.handleDataChange(changed),
 *     debounce: 100
 *   });
 *
 *   protected override updated(changedProperties: Map<string, unknown>): void {
 *     this.watcher.checkProperties(changedProperties);
 *   }
 * }
 * ```
 */
export class PropertyWatchController implements ReactiveController {
  private host: ReactiveControllerHost;
  private options: PropertyWatchOptions;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingChanges: Map<string, unknown> = new Map();
  private _initialized = false;

  constructor(host: ReactiveControllerHost, options: PropertyWatchOptions) {
    this.host = host;
    this.options = options;
    host.addController(this);
  }

  /** Whether the component has been initialized (first update completed) */
  get initialized(): boolean {
    return this._initialized;
  }

  hostConnected(): void {
    // Reset state on reconnect
    this.pendingChanges.clear();
    this._initialized = false;
  }

  hostDisconnected(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.pendingChanges.clear();
  }

  /**
   * Check if any watched properties changed and trigger callback
   * Call this from the component's updated() lifecycle method
   */
  checkProperties(changedProperties: Map<string, unknown>): void {
    // Mark as initialized after first check
    if (!this._initialized) {
      this._initialized = true;
    }

    // Collect changes for watched properties
    for (const prop of this.options.properties) {
      if (changedProperties.has(prop)) {
        this.pendingChanges.set(prop, changedProperties.get(prop));
      }
    }

    if (this.pendingChanges.size === 0) {
      return;
    }

    const debounceMs = this.options.debounce ?? 0;

    if (debounceMs > 0) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => this.flush(), debounceMs);
    } else {
      this.flush();
    }
  }

  /**
   * Force flush pending changes immediately
   */
  flush(): void {
    if (this.pendingChanges.size > 0) {
      const changes = new Map(this.pendingChanges);
      this.pendingChanges.clear();
      this.options.callback(changes);
    }
  }

  /**
   * Check if a specific property is being watched
   */
  isWatching(property: string): boolean {
    return this.options.properties.includes(property);
  }

  /**
   * Update the list of watched properties
   */
  setWatchedProperties(properties: string[]): void {
    this.options.properties = properties;
  }
}
