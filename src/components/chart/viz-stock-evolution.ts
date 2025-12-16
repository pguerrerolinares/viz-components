import { html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import Highcharts from 'highcharts/highstock';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import 'highcharts/themes/adaptive';
import { VizBaseComponent } from '../../base/viz-base-component.js';
import { highchartsThemeStyles } from '../../styles/highcharts-theme.js';
import { chartHeaderStyles } from '../../styles/chart-header.js';
import { generateHistoricalPrices, getMarketEvents } from '../../utils/sample-data.js';
import type {
  PriceDataPoint,
  MarketEvent,
  MarketEventType,
  StockEvolutionConfig,
} from '../../types/index.js';

// Initialize Highcharts modules
if (typeof HighchartsAccessibility === 'function') {
  (HighchartsAccessibility as unknown as (hc: typeof Highcharts) => void)(Highcharts);
}

// Default event colors by type
const DEFAULT_EVENT_COLORS: Record<MarketEventType, string> = {
  crash: '#ef4444',
  rally: '#22c55e',
  policy: '#f59e0b',
  crisis: '#dc2626',
  milestone: '#3b82f6',
};

// Event type labels for modal
const EVENT_TYPE_LABELS: Record<MarketEventType, string> = {
  crash: 'Market Crash',
  rally: 'Market Rally',
  policy: 'Policy Change',
  crisis: 'Crisis Event',
  milestone: 'Milestone',
};

// Lucide icon paths (just the inner content, without svg wrapper)
const LUCIDE_PATHS: Record<MarketEventType, string> = {
  crash: `<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>`,
  rally: `<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>`,
  policy: `<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>`,
  crisis: `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>`,
  milestone: `<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>`,
};

// Lucide SVG icons for modal (full SVG)
const LUCIDE_ICONS: Record<MarketEventType, string> = {
  crash: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${LUCIDE_PATHS.crash}</svg>`,
  rally: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${LUCIDE_PATHS.rally}</svg>`,
  policy: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${LUCIDE_PATHS.policy}</svg>`,
  crisis: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${LUCIDE_PATHS.crisis}</svg>`,
  milestone: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${LUCIDE_PATHS.milestone}</svg>`,
};

// Calendar icon for date display
const CALENDAR_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`;

// Stem height levels for staggering close flags
const STEM_HEIGHTS = {
  short: 20,
  medium: 35,
  long: 50,
};

/**
 * Generate a flag marker SVG with stem and centered icon badge
 * The marker has a vertical stem at bottom and circular badge at top
 * SVG is padded so the center aligns with the stem bottom (anchor point)
 *
 * @param type - Event type for icon selection
 * @param bgColor - Background color for badge and stem
 * @param stemHeight - Height of the stem (use STEM_HEIGHTS for staggering)
 */
function createMarkerSvg(
  type: MarketEventType,
  bgColor: string,
  stemHeight: number = STEM_HEIGHTS.medium
): string {
  const iconPath = LUCIDE_PATHS[type];
  const badgeRadius = 14;
  const badgeDiameter = badgeRadius * 2; // 28
  const stemWidth = 2.5;

  // Visual content height: badge + stem
  const contentHeight = badgeDiameter + stemHeight;

  // Total SVG height is doubled so center = bottom of stem
  // This makes Highcharts position the stem bottom at the data point
  const totalHeight = contentHeight * 2;
  const totalWidth = badgeDiameter + 4; // Extra padding for border
  const centerX = totalWidth / 2;

  // Badge center position
  const badgeCenterY = badgeRadius + 2;
  const stemStartY = badgeDiameter + 2;
  const stemEndY = contentHeight;

  // Icon: Lucide icons are 24x24, scale to fit in badge
  // We want ~16px icon in 28px badge
  const iconScale = 0.65;

  // To center the icon: translate so that after scaling, icon center aligns with badge center
  // Icon center in original coords is (12, 12)
  // After scale(s), icon center moves to (12*s, 12*s) relative to translate origin
  // We want: translateX + 12*s = centerX → translateX = centerX - 12*s
  const iconTranslateX = centerX - (12 * iconScale);
  const iconTranslateY = badgeCenterY - (12 * iconScale);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
    <!-- Stem line from badge to anchor point -->
    <line x1="${centerX}" y1="${stemStartY}" x2="${centerX}" y2="${stemEndY}" stroke="${bgColor}" stroke-width="${stemWidth}" stroke-linecap="round"/>
    <!-- Small dot at anchor point -->
    <circle cx="${centerX}" cy="${stemEndY}" r="3" fill="${bgColor}"/>
    <!-- Circular badge background with shadow effect -->
    <circle cx="${centerX}" cy="${badgeCenterY}" r="${badgeRadius}" fill="${bgColor}" stroke="white" stroke-width="2.5"/>
    <!-- Icon centered in badge -->
    <g transform="translate(${iconTranslateX.toFixed(2)}, ${iconTranslateY.toFixed(2)}) scale(${iconScale})" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${iconPath}
    </g>
  </svg>`;
  return `url(data:image/svg+xml;base64,${btoa(svg)})`;
}

/**
 * Calculate marker height based on stem height (for Highcharts positioning)
 */
function getMarkerHeight(stemHeight: number): number {
  const badgeDiameter = 28;
  return (badgeDiameter + stemHeight) * 2;
}

/**
 * Stock Evolution Chart Component
 * Shows historical price evolution with major market event flags
 */
@customElement('viz-stock-evolution')
export class VizStockEvolution extends VizBaseComponent {
  @property({ type: Object })
  config: StockEvolutionConfig = {};

  @property({ type: Array })
  prices: PriceDataPoint[] = [];

  @property({ type: Array })
  events: MarketEvent[] = [];

  @state()
  private selectedEvent: MarketEvent | null = null;

  /** Cached change info to avoid recalculation on every render */
  @state()
  private cachedChangeInfo: { change: number; percent: number; direction: 'up' | 'down' } = {
    change: 0,
    percent: 0,
    direction: 'up',
  };

  private chart: Highcharts.Chart | null = null;
  private containerRef = createRef<HTMLDivElement>();
  private lastPrice = 0;
  private useSampleData = true;

  static override styles = [
    ...VizBaseComponent.styles,
    highchartsThemeStyles,
    chartHeaderStyles,
    css`
      :host {
        display: block;
        min-height: 550px;
      }

      .evolution-container {
        width: 100%;
        height: 500px;
      }

      .chart-info {
        font-size: 0.75rem;
        color: var(--_text);
        opacity: 0.7;
      }

      /* Modal styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .modal {
        background: var(--_bg);
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        max-width: 420px;
        width: 90%;
        overflow: hidden;
        animation: slideIn 0.3s ease-out;
      }

      .modal-header {
        padding: 1.25rem 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        border-bottom: 1px solid rgba(128, 128, 128, 0.2);
      }

      .modal-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      .modal-icon.crash {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
      }

      .modal-icon.rally {
        background: rgba(34, 197, 94, 0.15);
        color: #22c55e;
      }

      .modal-icon.policy {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
      }

      .modal-icon.crisis {
        background: rgba(220, 38, 38, 0.15);
        color: #dc2626;
      }

      .modal-icon.milestone {
        background: rgba(59, 130, 246, 0.15);
        color: #3b82f6;
      }

      .modal-title-group {
        flex: 1;
        min-width: 0;
      }

      .modal-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--_text);
        margin: 0 0 0.25rem 0;
      }

      .modal-type {
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.7;
        color: var(--_text);
      }

      .modal-body {
        padding: 1.5rem;
      }

      .modal-date {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: var(--_text);
        opacity: 0.8;
        margin-bottom: 1rem;
      }

      .modal-date-icon {
        font-size: 1rem;
      }

      .modal-description {
        font-size: 1rem;
        line-height: 1.6;
        color: var(--_text);
        margin: 0;
      }

      .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid rgba(128, 128, 128, 0.2);
        display: flex;
        justify-content: flex-end;
      }

      .modal-close-btn {
        background: var(--_primary);
        color: #ffffff;
        border: none;
        padding: 0.625rem 1.25rem;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.2s, transform 0.1s;
      }

      .modal-close-btn:hover {
        opacity: 0.9;
      }

      .modal-close-btn:active {
        transform: scale(0.98);
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    this.setupThemeObserver();

    // Load sample data if no custom data provided
    if (this.prices.length === 0) {
      this.loadSampleData();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.cleanupThemeObserver();
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    const needsChartUpdate =
      !this.chart ||
      changedProperties.has('prices') ||
      changedProperties.has('events') ||
      changedProperties.has('config') ||
      changedProperties.has('theme');

    if (needsChartUpdate) {
      this.updateChart();
    }

    // Update cached change info when prices change
    if (changedProperties.has('prices')) {
      this.updateCachedChangeInfo();
    }
  }

  // isDarkMode(), getPrimaryColor(), applyHighchartsThemeClass() inherited from VizBaseComponent

  protected override updateTheme(): void {
    const container = this.containerRef.value;
    if (!container) return;

    const primaryColor = this.getPrimaryColor();

    // Apply theme class to container - CSS custom properties will cascade to chart
    this.applyHighchartsThemeClass(container);

    // Force chart to re-read CSS custom property values
    if (this.chart) {
      // Save zoom state
      const xAxis = this.chart.xAxis[0];
      const extremes = xAxis?.getExtremes();

      // Batch: suppress redraw on update, let setExtremes handle final redraw
      this.chart.update(
        {
          rangeSelector: {
            buttonTheme: {
              states: {
                hover: { fill: primaryColor, style: { color: '#ffffff' } },
                select: { fill: primaryColor, style: { color: '#ffffff', fontWeight: 'bold' } },
              },
            },
          },
        },
        false,
        false,
        false
      );

      // Restore zoom state with single redraw
      if (xAxis && extremes && extremes.userMin !== undefined) {
        xAxis.setExtremes(extremes.userMin, extremes.userMax, true, false);
      } else {
        this.chart.redraw();
      }
    }
  }

  private loadSampleData(): void {
    this.useSampleData = true;
    this.prices = generateHistoricalPrices();
    this.events = getMarketEvents();
  }

  private updateChart(): void {
    const container = this.containerRef.value;
    if (!container || this.prices.length === 0) return;

    // Apply initial theme class to container
    this.applyHighchartsThemeClass(container);

    const cfg = this.config;
    const primaryColor = this.getPrimaryColor();
    const eventColors = cfg.eventColors ?? DEFAULT_EVENT_COLORS;

    // Transform price data
    const priceData = this.prices.map((p) => [p.time, p.price]);
    const volumeData = this.prices.map((p) => [p.time, p.volume ?? 0]);

    // Set last price for header
    const lastPoint = this.prices[this.prices.length - 1];
    if (lastPoint) {
      this.lastPrice = lastPoint.price;
    }

    // Binary search helper to find price at a given date - O(log n) instead of O(n)
    const findPriceAtDate = (timestamp: number): number => {
      if (this.prices.length === 0) return 0;

      let left = 0;
      let right = this.prices.length - 1;

      // Binary search for closest timestamp
      while (left < right) {
        const mid = Math.floor((left + right) / 2);
        const midPrice = this.prices[mid];
        if (!midPrice) break;

        if (midPrice.time < timestamp) {
          left = mid + 1;
        } else {
          right = mid;
        }
      }

      // Check if left or left-1 is closer (handle edge cases)
      const leftPrice = this.prices[left];
      const prevPrice = this.prices[left - 1];

      if (!leftPrice) return this.prices[0]?.price ?? 0;
      if (!prevPrice) return leftPrice.price;

      const leftDiff = Math.abs(timestamp - leftPrice.time);
      const prevDiff = Math.abs(timestamp - prevPrice.time);

      return leftDiff < prevDiff ? leftPrice.price : prevPrice.price;
    };

    // Transform events to scatter points with custom flag markers (stem + badge)
    // Stagger stem heights when events are close together to prevent overlap
    const markerWidth = 32;

    // Calculate time threshold for "close" events (90 days in milliseconds)
    const closeThresholdMs = 90 * 24 * 60 * 60 * 1000;

    // Sort events by date for proximity detection
    const sortedEvents = [...this.events]
      .filter(() => cfg.showEvents !== false)
      .map((event, originalIndex) => ({ event, originalIndex }))
      .sort((a, b) => a.event.date - b.event.date);

    // Assign stem heights based on proximity to neighbors
    const eventStemHeights = new Map<number, number>();

    sortedEvents.forEach((item, idx) => {
      const prevItem = sortedEvents[idx - 1];
      const nextItem = sortedEvents[idx + 1];

      const isCloseToPrev = prevItem && (item.event.date - prevItem.event.date) < closeThresholdMs;
      const isCloseToNext = nextItem && (nextItem.event.date - item.event.date) < closeThresholdMs;

      if (!isCloseToPrev && !isCloseToNext) {
        // Isolated event - use medium height
        eventStemHeights.set(item.originalIndex, STEM_HEIGHTS.medium);
      } else {
        // Close to neighbors - cycle through heights
        const prevHeight = prevItem ? eventStemHeights.get(prevItem.originalIndex) : undefined;

        if (prevHeight === STEM_HEIGHTS.short) {
          eventStemHeights.set(item.originalIndex, STEM_HEIGHTS.long);
        } else if (prevHeight === STEM_HEIGHTS.long) {
          eventStemHeights.set(item.originalIndex, STEM_HEIGHTS.short);
        } else {
          // First in a cluster or after medium
          eventStemHeights.set(item.originalIndex, STEM_HEIGHTS.short);
        }
      }
    });

    const eventsData = this.events
      .filter(() => cfg.showEvents !== false)
      .map((event, index) => {
        const stemHeight = eventStemHeights.get(index) ?? STEM_HEIGHTS.medium;
        const markerHeight = getMarkerHeight(stemHeight);

        return {
          x: event.date,
          y: findPriceAtDate(event.date),
          name: event.title,
          marker: {
            symbol: createMarkerSvg(event.type, eventColors[event.type], stemHeight),
            width: markerWidth,
            height: markerHeight,
          },
          custom: { eventIndex: index },
        };
      });

    // Default to Highcharts color-0 or user-specified color
    const areaColor = cfg.areaColor ?? '#2caffe';
    const series: Highcharts.SeriesOptionsType[] = [
      {
        type: 'area',
        id: 'price',
        name: cfg.symbol ?? 'S&P 500',
        data: priceData,
        lineColor: areaColor,
        lineWidth: 2,
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, Highcharts.color(areaColor).setOpacity(0.4).get('rgba') as string],
            [1, Highcharts.color(areaColor).setOpacity(0.05).get('rgba') as string],
          ],
        },
        threshold: null,
        tooltip: {
          valueDecimals: 2,
          valuePrefix: cfg.currency ?? '$',
        },
      } as Highcharts.SeriesAreaOptions,
    ];

    // Add scatter series for event markers with custom flag icons
    if (eventsData.length > 0 && cfg.showEvents !== false) {
      series.push({
        type: 'scatter',
        id: 'events',
        name: 'Market Events',
        data: eventsData,
        marker: {
          enabled: true,
          // Size is controlled per-point via marker.width/height
        },
        // Improve click detection for zoomed out views
        findNearestPointBy: 'xy',
        stickyTracking: false,
        states: {
          hover: {
            enabled: true,
            halo: {
              size: 12, // Visible hover halo for better feedback
              opacity: 0.2,
            },
          },
          inactive: {
            opacity: 1, // Keep markers visible when hovering other series
          },
        },
        cursor: 'pointer',
        point: {
          events: {
            click: (e: Highcharts.PointClickEventObject) => {
              const point = e.point as Highcharts.Point & { custom?: { eventIndex: number } };
              const eventIndex = point.custom?.eventIndex;
              if (eventIndex !== undefined && this.events[eventIndex]) {
                this.selectedEvent = this.events[eventIndex]!;
              }
            },
          },
        },
        tooltip: {
          pointFormat: '<b>{point.name}</b><br/><span style="color: #888">Click for details</span>',
        },
        zIndex: 10,
        enableMouseTracking: true,
        // Larger click radius for easier interaction
        boostThreshold: 0,
      } as Highcharts.SeriesScatterOptions);
    }

    // Add volume series if enabled
    if (cfg.showVolume) {
      series.push({
        type: 'column',
        id: 'volume',
        name: 'Volume',
        data: volumeData,
        yAxis: 1,
      } as Highcharts.SeriesColumnOptions);
    }

    const yAxis: Highcharts.YAxisOptions[] = [
      {
        labels: {
          align: 'right',
          x: -5,
          formatter: function () {
            return (cfg.currency ?? '$') + Highcharts.numberFormat(this.value as number, 0);
          },
        },
        height: cfg.showVolume ? '70%' : '100%',
        lineWidth: 1,
      },
    ];

    if (cfg.showVolume) {
      yAxis.push({
        labels: {
          align: 'right',
          x: -5,
        },
        top: '75%',
        height: '25%',
        offset: 0,
        lineWidth: 1,
      });
    }

    // Let adaptive theme handle colors via CSS custom properties
    const options: Highcharts.Options = {
      chart: {
        style: { fontFamily: 'inherit' },
        animation: true,
      },
      title: {
        text: cfg.title ?? '',
      },
      // Only configure rangeSelector on initial creation to preserve user selection
      ...(this.chart
        ? {}
        : {
            rangeSelector: {
              selected: 4,
              buttons: [
                { type: 'year', count: 1, text: '1Y' },
                { type: 'year', count: 5, text: '5Y' },
                { type: 'year', count: 10, text: '10Y' },
                { type: 'year', count: 20, text: '20Y' },
                { type: 'all', text: 'All' },
              ],
              buttonTheme: {
                fill: 'transparent',
                'stroke-width': 1,
                r: 4,
                states: {
                  hover: { fill: primaryColor, style: { color: '#ffffff' } },
                  select: { fill: primaryColor, style: { color: '#ffffff', fontWeight: 'bold' } },
                },
              },
            },
          }),
      navigator: {
        enabled: true,
      },
      scrollbar: {
        enabled: true,
      },
      xAxis: {
        type: 'datetime',
        gridLineWidth: 1,
      },
      yAxis,
      tooltip: {
        split: false,
        shared: true,
        shadow: true,
        snap: 30,
      },
      plotOptions: {
        area: {
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: true,
                radius: 5,
              },
            },
          },
        },
        series: {
          animation: { duration: 500 },
        },
        scatter: {
          // Increase point selection radius for easier clicking
          marker: {
            states: {
              hover: {
                enabled: true,
                radiusPlus: 4,
              },
            },
          },
          // Make points easier to click when zoomed out
          crisp: false,
        },
      },
      series,
      credits: { enabled: false },
      ...cfg.highcharts,
    };

    if (this.chart) {
      // Save current extremes to preserve zoom/selection state
      const xAxis = this.chart.xAxis[0];
      const extremes = xAxis?.getExtremes();

      this.chart.update(options, true, true);

      // Restore extremes if user had selected a specific range
      if (xAxis && extremes && extremes.userMin !== undefined) {
        xAxis.setExtremes(extremes.userMin, extremes.userMax, true, false);
      }
    } else {
      this.chart = Highcharts.stockChart(container, options);
    }
  }

  /** Updates the cached change info - called when prices change */
  private updateCachedChangeInfo(): void {
    if (this.prices.length < 2) {
      this.cachedChangeInfo = { change: 0, percent: 0, direction: 'up' };
      return;
    }

    const first = this.prices[0];
    const last = this.prices[this.prices.length - 1];
    if (!first || !last) {
      this.cachedChangeInfo = { change: 0, percent: 0, direction: 'up' };
      return;
    }

    const change = last.price - first.price;
    const percent = (change / first.price) * 100;

    this.cachedChangeInfo = {
      change,
      percent,
      direction: change >= 0 ? 'up' : 'down',
    };
  }

  private closeModal(): void {
    this.selectedEvent = null;
  }

  private handleOverlayClick(e: MouseEvent): void {
    // Close modal when clicking on overlay (not modal content)
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  private formatEventDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private renderModal() {
    if (!this.selectedEvent) return nothing;

    const event = this.selectedEvent;
    const svgIcon = LUCIDE_ICONS[event.type];
    const typeLabel = EVENT_TYPE_LABELS[event.type];

    return html`
      <div class="modal-overlay" part="modal-overlay" @click=${this.handleOverlayClick}>
        <div class="modal" part="modal">
          <div class="modal-header">
            <div class="modal-icon ${event.type}">${unsafeHTML(svgIcon)}</div>
            <div class="modal-title-group">
              <h3 class="modal-title">${event.title}</h3>
              <span class="modal-type">${typeLabel}</span>
            </div>
          </div>
          <div class="modal-body">
            <div class="modal-date">
              <span class="modal-date-icon">${unsafeHTML(CALENDAR_ICON)}</span>
              ${this.formatEventDate(event.date)}
            </div>
            <p class="modal-description">${event.description}</p>
          </div>
          <div class="modal-footer">
            <button class="modal-close-btn" @click=${this.closeModal}>Close</button>
          </div>
        </div>
      </div>
    `;
  }

  protected override render() {
    const { change, percent, direction } = this.cachedChangeInfo;
    const cfg = this.config;

    return html`
      <div class="chart-header" part="header">
        <div class="symbol-info">
          <span class="symbol" part="symbol">${cfg.symbol ?? 'S&P 500'}</span>
          <span class="price ${direction}" part="price">
            ${cfg.currency ?? '$'}${this.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span class="change ${direction}" part="change">
            ${direction === 'up' ? '+' : ''}${change.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            (${direction === 'up' ? '+' : ''}${percent.toFixed(2)}%)
          </span>
        </div>
        <div class="chart-info" part="info">
          ${this.useSampleData ? 'Sample data · ' : ''}${this.events.length} market events
        </div>
      </div>
      <div class="evolution-container" part="chart" ${ref(this.containerRef)}></div>
      ${this.renderModal()}
    `;
  }

  /**
   * Programmatic API
   */
  setData(prices: PriceDataPoint[], events?: MarketEvent[]): void {
    this.useSampleData = false;
    this.prices = prices;
    if (events) {
      this.events = events;
    }
  }

  addEvent(event: MarketEvent): void {
    this.events = [...this.events, event];
  }
}

// Re-export types for convenience
export type { PriceDataPoint, MarketEvent, MarketEventType, StockEvolutionConfig };

declare global {
  interface HTMLElementTagNameMap {
    'viz-stock-evolution': VizStockEvolution;
  }
}
