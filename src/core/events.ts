/**
 * Event utilities for viz-components
 * Provides standardized event creation and emission
 */

import type { VizEventDetail, VizCustomEvent } from '../types/events.js';

/**
 * Interface for components that can emit events
 */
export interface EventEmitterHost {
  tagName: string;
  dispatchEvent(event: Event): boolean;
}

/**
 * Create a standardized viz-component custom event
 *
 * @param eventName - The event name (e.g., 'viz-point-click')
 * @param source - The component tag name that emits the event
 * @param data - The event-specific payload
 * @param options - Event options (bubbles, composed)
 * @returns A CustomEvent with standardized detail structure
 */
export function createVizEvent<T>(
  eventName: string,
  source: string,
  data: T,
  options?: { bubbles?: boolean; composed?: boolean }
): VizCustomEvent<T> {
  const detail: VizEventDetail<T> = {
    source,
    timestamp: Date.now(),
    data,
  };

  return new CustomEvent(eventName, {
    detail,
    bubbles: options?.bubbles ?? true,
    composed: options?.composed ?? true,
  });
}

/**
 * Emit a standardized viz-component event from a host element
 *
 * @param host - The component emitting the event
 * @param eventName - The event name (e.g., 'viz-point-click')
 * @param data - The event-specific payload
 * @returns Whether the event was dispatched successfully
 */
export function emitVizEvent<T>(
  host: EventEmitterHost,
  eventName: string,
  data: T
): boolean {
  const event = createVizEvent(eventName, host.tagName.toLowerCase(), data);
  return host.dispatchEvent(event);
}
