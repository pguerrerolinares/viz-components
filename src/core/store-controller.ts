/**
 * StoreController - Reactive controller for connecting Lit components to VizStore
 * Follows the same pattern as ThemeController and PropertyWatchController
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { VizStore } from './store.js';
import type { StoreControllerOptions, StateSubscriber } from '../types/store.js';

// ============================================================================
// Store Controller
// ============================================================================

/**
 * Reactive controller for connecting Lit components to VizStore
 *
 * @example
 * ```typescript
 * class MyComponent extends LitElement {
 *   private storeController = new StoreController(this, {
 *     namespace: 'dashboard',
 *     keys: ['selectedSymbol', 'dateRange'],
 *     onStateChange: (key, value) => this.handleStateChange(key, value),
 *   });
 *
 *   get selectedSymbol() {
 *     return this.storeController.get<string>('selectedSymbol');
 *   }
 *
 *   private handleStateChange(key: string, value: unknown) {
 *     if (key === 'selectedSymbol') {
 *       this.loadDataForSymbol(value as string);
 *     }
 *   }
 * }
 * ```
 */
export class StoreController implements ReactiveController {
  private host: ReactiveControllerHost;
  private options: StoreControllerOptions;
  private store: VizStore;
  private unsubscribers: (() => void)[] = [];

  constructor(host: ReactiveControllerHost, options: StoreControllerOptions = {}) {
    this.host = host;
    this.options = options;
    this.store = VizStore.getInstance(options.namespace ?? 'default');
    host.addController(this);
  }

  /** Get the underlying store instance */
  getStore(): VizStore {
    return this.store;
  }

  /** Get the store namespace */
  getNamespace(): string {
    return this.store.getNamespace();
  }

  /** Get a value from the store */
  get<T>(key: string): T | undefined {
    return this.store.get<T>(key);
  }

  /** Get a value with default fallback */
  getOrDefault<T>(key: string, defaultValue: T): T {
    return this.store.getOrDefault(key, defaultValue);
  }

  /** Set a value in the store */
  set<T>(key: string, value: T): void {
    this.store.set(key, value);
  }

  /** Set multiple values */
  setMany(updates: Record<string, unknown>): void {
    this.store.setMany(updates);
  }

  /** Check if key exists */
  has(key: string): boolean {
    return this.store.has(key);
  }

  /** Delete a key */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  hostConnected(): void {
    this.setupSubscriptions();
  }

  hostDisconnected(): void {
    this.cleanup();
  }

  private setupSubscriptions(): void {
    const { keys, onStateChange, watchAll } = this.options;

    if (!onStateChange) return;

    if (watchAll) {
      // Subscribe to all changes
      const unsubscribe = this.store.subscribeAll((key, value, prev) => {
        onStateChange(key, value, prev);
        // Defer requestUpdate to avoid scheduling during update cycle
        queueMicrotask(() => this.host.requestUpdate());
      });
      this.unsubscribers.push(unsubscribe);
    } else if (keys && keys.length > 0) {
      // Subscribe to specific keys
      for (const key of keys) {
        const unsubscribe = this.store.subscribe(key, (k, value, prev) => {
          onStateChange(k, value, prev);
          // Defer requestUpdate to avoid scheduling during update cycle
          queueMicrotask(() => this.host.requestUpdate());
        });
        this.unsubscribers.push(unsubscribe);
      }
    }
  }

  private cleanup(): void {
    for (const unsubscribe of this.unsubscribers) {
      unsubscribe();
    }
    this.unsubscribers = [];
  }

  /**
   * Dynamically add a key to watch
   */
  watchKey(key: string): () => void {
    const { onStateChange } = this.options;

    if (onStateChange) {
      const unsubscribe = this.store.subscribe(key, (k, value, prev) => {
        onStateChange(k, value, prev);
        queueMicrotask(() => this.host.requestUpdate());
      });
      this.unsubscribers.push(unsubscribe);
      return unsubscribe;
    }

    return () => {};
  }

  /**
   * Subscribe to a key with a custom callback (bypasses onStateChange)
   */
  subscribeKey<T>(key: string, callback: StateSubscriber<T>): () => void {
    const unsubscribe = this.store.subscribe(key, (k, value, prev) => {
      callback(k, value as T, prev as T | undefined);
      queueMicrotask(() => this.host.requestUpdate());
    });
    this.unsubscribers.push(unsubscribe);
    return unsubscribe;
  }
}
