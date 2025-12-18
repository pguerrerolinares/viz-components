/**
 * VizStore - Lightweight shared state container
 * Framework-agnostic, works across any component type
 */

import type {
  StoreNamespace,
  StateChangeData,
  StateSubscriber,
  VizStoreOptions,
} from '../types/store.js';

// ============================================================================
// VizStore Singleton
// ============================================================================

/**
 * Lightweight shared state container with pub/sub
 *
 * Key Design Principles:
 * - Singleton per namespace (allows isolated dashboards)
 * - No external dependencies
 * - Emits DOM events for cross-framework communication
 * - Optional persistence to localStorage
 *
 * @example
 * ```typescript
 * // Get store instance
 * const store = VizStore.getInstance('dashboard');
 *
 * // Read/write state
 * store.set('selectedSymbol', 'AAPL');
 * const symbol = store.get<string>('selectedSymbol');
 *
 * // Subscribe to changes
 * const unsubscribe = store.subscribe('selectedSymbol', (key, value, prev) => {
 *   console.log(`Changed: ${prev} -> ${value}`);
 * });
 *
 * // With persistence
 * const persistedStore = VizStore.getInstance('settings', { persist: true });
 * ```
 */
export class VizStore {
  private static instances = new Map<StoreNamespace, VizStore>();

  private state = new Map<string, unknown>();
  private subscribers = new Map<string, Set<StateSubscriber>>();
  private wildcardSubscribers = new Set<StateSubscriber>();
  private options: VizStoreOptions;
  private namespace: StoreNamespace;

  private constructor(namespace: StoreNamespace, options: VizStoreOptions = {}) {
    this.namespace = namespace;
    this.options = options;

    if (options.persist) {
      this.loadFromStorage();
    }
  }

  /**
   * Get or create a store instance for a namespace
   */
  static getInstance(
    namespace: StoreNamespace = 'default',
    options?: VizStoreOptions
  ): VizStore {
    if (!VizStore.instances.has(namespace)) {
      VizStore.instances.set(namespace, new VizStore(namespace, options));
    }
    return VizStore.instances.get(namespace)!;
  }

  /**
   * Clear all store instances (useful for testing)
   */
  static clearAll(): void {
    VizStore.instances.clear();
  }

  /**
   * Get the namespace of this store
   */
  getNamespace(): StoreNamespace {
    return this.namespace;
  }

  /**
   * Get current value for a key
   */
  get<T>(key: string): T | undefined {
    return this.state.get(key) as T | undefined;
  }

  /**
   * Get current value with a default fallback
   */
  getOrDefault<T>(key: string, defaultValue: T): T {
    const value = this.state.get(key);
    return value !== undefined ? (value as T) : defaultValue;
  }

  /**
   * Set a value and notify subscribers
   */
  set<T>(key: string, value: T): void {
    const previousValue = this.state.get(key) as T | undefined;

    // Skip if value unchanged (shallow comparison)
    if (previousValue === value) return;

    this.state.set(key, value);

    // Persist if enabled
    if (this.options.persist) {
      this.saveToStorage();
    }

    // Debug logging
    if (this.options.debug) {
      console.log(`[VizStore:${this.namespace}] ${key}:`, previousValue, '->', value);
    }

    // Notify specific subscribers
    this.notifySubscribers(key, value, previousValue);

    // Emit DOM event for cross-framework communication
    this.emitStateChangeEvent(key, value, previousValue);
  }

  /**
   * Update multiple values atomically
   */
  setMany(updates: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(updates)) {
      this.set(key, value);
    }
  }

  /**
   * Subscribe to changes for a specific key
   */
  subscribe<T>(key: string, callback: StateSubscriber<T>): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback as StateSubscriber);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(key)?.delete(callback as StateSubscriber);
    };
  }

  /**
   * Subscribe to all state changes (wildcard)
   */
  subscribeAll(callback: StateSubscriber): () => void {
    this.wildcardSubscribers.add(callback);
    return () => {
      this.wildcardSubscribers.delete(callback);
    };
  }

  /**
   * Check if a key exists in state
   */
  has(key: string): boolean {
    return this.state.has(key);
  }

  /**
   * Delete a key from state
   */
  delete(key: string): boolean {
    const previousValue = this.state.get(key);
    const deleted = this.state.delete(key);

    if (deleted) {
      if (this.options.persist) {
        this.saveToStorage();
      }
      this.notifySubscribers(key, undefined, previousValue);
      this.emitStateChangeEvent(key, undefined, previousValue);
    }

    return deleted;
  }

  /**
   * Clear all state
   */
  clear(): void {
    this.state.clear();
    if (this.options.persist) {
      this.clearStorage();
    }
  }

  /**
   * Get all keys in the store
   */
  keys(): string[] {
    return Array.from(this.state.keys());
  }

  /**
   * Get snapshot of entire state (for debugging)
   */
  snapshot(): Record<string, unknown> {
    return Object.fromEntries(this.state);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private notifySubscribers<T>(
    key: string,
    value: T,
    previousValue: T | undefined
  ): void {
    // Notify key-specific subscribers
    const keySubscribers = this.subscribers.get(key);
    if (keySubscribers) {
      for (const callback of keySubscribers) {
        try {
          callback(key, value, previousValue);
        } catch (error) {
          console.error(`[VizStore] Subscriber error for ${key}:`, error);
        }
      }
    }

    // Notify wildcard subscribers
    for (const callback of this.wildcardSubscribers) {
      try {
        callback(key, value, previousValue);
      } catch (error) {
        console.error('[VizStore] Wildcard subscriber error:', error);
      }
    }
  }

  private emitStateChangeEvent<T>(
    key: string,
    value: T,
    previousValue: T | undefined
  ): void {
    const eventData: StateChangeData<T> = {
      namespace: this.namespace,
      key,
      value,
      previousValue,
    };

    // Create standardized event matching VizEventDetail structure
    const event = new CustomEvent('viz-state-change', {
      detail: {
        source: 'viz-store',
        timestamp: Date.now(),
        data: eventData,
      },
      bubbles: true,
      composed: true,
    });

    // Dispatch from document for global listening
    document.dispatchEvent(event);
  }

  private loadFromStorage(): void {
    const storageKey = this.getStorageKey();
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, unknown>;
        for (const [key, value] of Object.entries(parsed)) {
          this.state.set(key, value);
        }
      }
    } catch (error) {
      console.warn('[VizStore] Failed to load from storage:', error);
    }
  }

  private saveToStorage(): void {
    const storageKey = this.getStorageKey();
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(Object.fromEntries(this.state))
      );
    } catch (error) {
      console.warn('[VizStore] Failed to save to storage:', error);
    }
  }

  private clearStorage(): void {
    const storageKey = this.getStorageKey();
    localStorage.removeItem(storageKey);
  }

  private getStorageKey(): string {
    const prefix = this.options.storagePrefix ?? 'viz-store';
    return `${prefix}:${this.namespace}`;
  }
}
