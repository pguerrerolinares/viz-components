/**
 * Store type definitions for viz-components
 * Provides shared state management across components
 */

/**
 * State slice identifier - allows multiple isolated state scopes
 */
export type StoreNamespace = string;

/**
 * State change event data structure
 */
export interface StateChangeData<T = unknown> {
  /** Namespace of the store */
  namespace: StoreNamespace;
  /** Key that changed */
  key: string;
  /** New value */
  value: T;
  /** Previous value (undefined if key was newly created) */
  previousValue: T | undefined;
}

/**
 * Subscription callback type
 */
export type StateSubscriber<T = unknown> = (
  key: string,
  value: T,
  previousValue: T | undefined
) => void;

/**
 * Store configuration options
 */
export interface VizStoreOptions {
  /** Enable debug logging to console */
  debug?: boolean;
  /** Persist state to localStorage */
  persist?: boolean;
  /** Storage key prefix for persistence (default: 'viz-store') */
  storagePrefix?: string;
}

/**
 * Controller options for StoreController
 */
export interface StoreControllerOptions {
  /** Store namespace to connect to (default: 'default') */
  namespace?: StoreNamespace;
  /** Keys to watch for changes */
  keys?: string[];
  /** Callback when any watched key changes */
  onStateChange?: StateSubscriber;
  /** Subscribe to all state changes (ignores keys option) */
  watchAll?: boolean;
}
