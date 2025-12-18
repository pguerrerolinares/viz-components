/**
 * Flag layout utilities for positioning event markers
 * Handles collision avoidance for overlapping flags
 */

import { STEM_HEIGHTS } from './market-event-icons.js';

// Time threshold for "close" events (90 days)
const CLOSE_THRESHOLD_MS = 90 * 24 * 60 * 60 * 1000;

// Minimum vertical separation between icons (as percentage of price range)
const MIN_ICON_SEPARATION_PERCENT = 0.04; // 4% of visible price range

export interface EventWithPosition {
  date: number;
  index: number;
  basePrice: number;
}

export interface LayoutResult {
  index: number;
  stemHeight: number;
}

/**
 * Convert stem height (pixels) to approximate price-space offset
 */
function stemToPrice(stemHeight: number, priceRange: number): number {
  // Approximate: stem heights map to percentage of price range
  // short=20 → ~2%, medium=35 → ~4%, long=50 → ~6%
  const stemPercent = (stemHeight / STEM_HEIGHTS.long) * 0.06;
  return priceRange * stemPercent;
}

/**
 * Find a stem height that doesn't collide with occupied positions
 */
function findNonCollidingStemHeight(
  basePrice: number,
  occupiedPositions: number[],
  minSeparation: number,
  priceRange: number
): number {
  const heights = [STEM_HEIGHTS.short, STEM_HEIGHTS.medium, STEM_HEIGHTS.long];

  // Try each height and pick the first one without collision
  for (const height of heights) {
    const candidateY = basePrice + stemToPrice(height, priceRange);
    const hasCollision = occupiedPositions.some(
      pos => Math.abs(candidateY - pos) < minSeparation
    );
    if (!hasCollision) {
      return height;
    }
  }

  // All heights collide, find the one with maximum separation
  let bestHeight: number = STEM_HEIGHTS.long;
  let maxMinDistance = 0;

  for (const height of heights) {
    const candidateY = basePrice + stemToPrice(height, priceRange);
    const minDistance = Math.min(
      ...occupiedPositions.map(pos => Math.abs(candidateY - pos))
    );
    if (minDistance > maxMinDistance) {
      maxMinDistance = minDistance;
      bestHeight = height;
    }
  }

  return bestHeight;
}

/**
 * Calculate stem heights for event flags using greedy collision avoidance.
 *
 * Algorithm:
 * 1. Sort events by date
 * 2. For each event, calculate its base price (Y position on chart)
 * 3. For nearby events, ensure their final icon positions (price + stemHeight)
 *    don't collide by adjusting stem heights
 * 4. Uses price-space separation to handle varying price levels
 *
 * @param events - Array of events with date, index, and base price
 * @param priceRange - The total price range (max - min) of the chart
 * @returns Map from event index to stem height
 */
export function calculateFlagStemHeights(
  events: EventWithPosition[],
  priceRange: number
): Map<number, number> {
  const stemHeights = new Map<number, number>();
  if (events.length === 0) return stemHeights;

  const minSeparation = priceRange * MIN_ICON_SEPARATION_PERCENT;

  // Create sorted list with position tracking
  const eventsWithPrice = events.map(e => ({
    ...e,
    finalY: 0, // Will be calculated
    stemHeight: STEM_HEIGHTS.medium as number,
  }));

  eventsWithPrice.sort((a, b) => a.date - b.date);

  // Process each event
  for (let i = 0; i < eventsWithPrice.length; i++) {
    const current = eventsWithPrice[i]!;

    // Find nearby previous events (within time threshold)
    const nearbyPrevious: typeof eventsWithPrice = [];
    for (let j = i - 1; j >= 0; j--) {
      const prev = eventsWithPrice[j]!;
      if (current.date - prev.date > CLOSE_THRESHOLD_MS) break;
      nearbyPrevious.push(prev);
    }

    if (nearbyPrevious.length === 0) {
      // No nearby events, use medium stem
      current.stemHeight = STEM_HEIGHTS.medium;
      current.finalY = current.basePrice + stemToPrice(STEM_HEIGHTS.medium, priceRange);
    } else {
      // Find a stem height that avoids collisions
      const occupiedPositions = nearbyPrevious.map(e => e.finalY);
      current.stemHeight = findNonCollidingStemHeight(
        current.basePrice,
        occupiedPositions,
        minSeparation,
        priceRange
      );
      current.finalY = current.basePrice + stemToPrice(current.stemHeight, priceRange);
    }

    stemHeights.set(current.index, current.stemHeight);
  }

  return stemHeights;
}

/**
 * Configuration options for flag layout
 */
export interface FlagLayoutOptions {
  /** Time threshold in ms for considering events as "close" (default: 90 days) */
  closeThresholdMs?: number;
  /** Minimum separation as percentage of price range (default: 0.04 = 4%) */
  minSeparationPercent?: number;
}
