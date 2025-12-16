import { html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import Highcharts from 'highcharts/highstock';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import 'highcharts/themes/adaptive';
import { VizBaseComponent } from '../../base/viz-base-component.js';
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
 * Generate historical S&P 500-like price data from 2000 to 2024
 */
function generateHistoricalPrices(): PriceDataPoint[] {
  const data: PriceDataPoint[] = [];
  const startDate = new Date(2000, 0, 3); // Jan 3, 2000
  const endDate = new Date(2024, 11, 31); // Dec 31, 2024

  // Key price points to simulate S&P 500 history
  const keyPoints: { date: Date; price: number }[] = [
    { date: new Date(2000, 0, 1), price: 1469 },    // Jan 2000 - Dot-com peak era
    { date: new Date(2000, 2, 24), price: 1527 },   // Mar 2000 - NASDAQ peak
    { date: new Date(2001, 8, 10), price: 1092 },   // Sep 2001 - Pre-9/11
    { date: new Date(2001, 8, 21), price: 965 },    // Sep 2001 - Post-9/11 drop
    { date: new Date(2002, 9, 9), price: 776 },     // Oct 2002 - Bear market bottom
    { date: new Date(2003, 2, 11), price: 800 },    // Mar 2003 - Iraq war start
    { date: new Date(2007, 9, 9), price: 1565 },    // Oct 2007 - Pre-crisis peak
    { date: new Date(2008, 8, 15), price: 1192 },   // Sep 2008 - Lehman collapse
    { date: new Date(2009, 2, 9), price: 676 },     // Mar 2009 - Crisis bottom
    { date: new Date(2011, 7, 8), price: 1119 },    // Aug 2011 - Debt ceiling crisis
    { date: new Date(2015, 11, 16), price: 2043 },  // Dec 2015 - Fed rate hike
    { date: new Date(2018, 11, 24), price: 2351 },  // Dec 2018 - Trade war low
    { date: new Date(2020, 1, 19), price: 3386 },   // Feb 2020 - Pre-COVID peak
    { date: new Date(2020, 2, 23), price: 2237 },   // Mar 2020 - COVID bottom
    { date: new Date(2020, 10, 9), price: 3550 },   // Nov 2020 - Vaccine rally
    { date: new Date(2022, 0, 3), price: 4796 },    // Jan 2022 - All-time high
    { date: new Date(2022, 9, 12), price: 3577 },   // Oct 2022 - Bear market low
    { date: new Date(2024, 11, 31), price: 5900 },  // Dec 2024 - Current
  ];

  // Helper to interpolate between key points
  function getPriceForDate(date: Date): number {
    const timestamp = date.getTime();

    // Find surrounding key points
    let before = keyPoints[0]!;
    let after = keyPoints[keyPoints.length - 1]!;

    for (let i = 0; i < keyPoints.length - 1; i++) {
      const current = keyPoints[i]!;
      const next = keyPoints[i + 1]!;
      if (timestamp >= current.date.getTime() && timestamp <= next.date.getTime()) {
        before = current;
        after = next;
        break;
      }
    }

    // Linear interpolation
    const ratio = (timestamp - before.date.getTime()) / (after.date.getTime() - before.date.getTime());
    const basePrice = before.price + (after.price - before.price) * ratio;

    // Add daily volatility (±0.5%)
    const volatility = (Math.random() - 0.5) * 0.01 * basePrice;

    return Math.round((basePrice + volatility) * 100) / 100;
  }

  // Generate daily data points (trading days only - skip weekends)
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();

    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const price = getPriceForDate(currentDate);
      const volume = Math.floor(2000000000 + Math.random() * 3000000000); // 2-5 billion shares

      data.push({
        time: currentDate.getTime(),
        price,
        volume,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}

/**
 * Major market events from 2000-2024
 */
function getMarketEvents(): MarketEvent[] {
  return [
    {
      date: new Date(2000, 2, 10).getTime(),
      title: 'Dot-com Peak',
      description: 'NASDAQ reaches all-time high of 5,048. Tech bubble at maximum.',
      type: 'milestone',
    },
    {
      date: new Date(2001, 8, 17).getTime(),
      title: '9/11 Attacks',
      description: 'Markets closed for 4 days. S&P drops 11.6% on reopening week.',
      type: 'crisis',
    },
    {
      date: new Date(2002, 9, 9).getTime(),
      title: 'Bear Bottom',
      description: 'S&P 500 hits 776, down 49% from 2000 peak. Dot-com crash ends.',
      type: 'crash',
    },
    {
      date: new Date(2007, 9, 9).getTime(),
      title: 'Bull Peak',
      description: 'S&P 500 reaches 1,565. Housing bubble about to burst.',
      type: 'milestone',
    },
    {
      date: new Date(2008, 8, 15).getTime(),
      title: 'Lehman Collapse',
      description: 'Lehman Brothers files for bankruptcy. Global financial crisis begins.',
      type: 'crash',
    },
    {
      date: new Date(2009, 2, 9).getTime(),
      title: 'Crisis Bottom',
      description: 'S&P 500 hits 676, down 57% from 2007 peak. Start of longest bull run.',
      type: 'rally',
    },
    {
      date: new Date(2011, 7, 5).getTime(),
      title: 'Debt Crisis',
      description: 'S&P downgrades US credit rating. Markets drop 6.7% in one day.',
      type: 'policy',
    },
    {
      date: new Date(2015, 11, 16).getTime(),
      title: 'Fed Rate Hike',
      description: 'First interest rate increase since 2006. End of zero-rate policy.',
      type: 'policy',
    },
    {
      date: new Date(2020, 1, 19).getTime(),
      title: 'Pre-COVID High',
      description: 'S&P 500 reaches all-time high of 3,386 before pandemic.',
      type: 'milestone',
    },
    {
      date: new Date(2020, 2, 23).getTime(),
      title: 'COVID Crash',
      description: 'S&P 500 drops 34% in 33 days. Fastest bear market in history.',
      type: 'crash',
    },
    {
      date: new Date(2020, 10, 9).getTime(),
      title: 'Vaccine Rally',
      description: 'Pfizer vaccine news sparks massive rally. Markets surge 4%.',
      type: 'rally',
    },
    {
      date: new Date(2022, 2, 16).getTime(),
      title: 'Fed Tightening',
      description: 'Fed begins aggressive rate hike cycle to combat inflation.',
      type: 'policy',
    },
  ];
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

  private chart: Highcharts.Chart | null = null;
  private containerRef = createRef<HTMLDivElement>();
  private lastPrice = 0;
  private useSampleData = true;

  static override styles = [
    ...VizBaseComponent.styles,
    css`
      :host {
        display: block;
        min-height: 550px;
      }

      .evolution-container {
        width: 100%;
        height: 500px;
      }

      /* Highcharts adaptive theme CSS custom properties - defined on container to override :root */
      .evolution-container.highcharts-light {
        --highcharts-background-color: #ffffff;
        --highcharts-color-0: #2caffe;
        --highcharts-color-1: #544fc5;
        --highcharts-color-2: #00e272;
        --highcharts-color-3: #fe6a35;
        --highcharts-color-4: #6b8abc;
        --highcharts-color-5: #d568fb;
        --highcharts-color-6: #2ee0ca;
        --highcharts-color-7: #fa4b42;
        --highcharts-color-8: #feb56a;
        --highcharts-color-9: #91e8e1;
        --highcharts-neutral-color-100: #000000;
        --highcharts-neutral-color-80: #333333;
        --highcharts-neutral-color-60: #666666;
        --highcharts-neutral-color-40: #999999;
        --highcharts-neutral-color-20: #cccccc;
        --highcharts-neutral-color-10: #e6e6e6;
        --highcharts-neutral-color-5: #f2f2f2;
        --highcharts-neutral-color-3: #f7f7f7;
        --highcharts-highlight-color-100: #0022ff;
        --highcharts-highlight-color-80: #334eff;
        --highcharts-highlight-color-60: #667aff;
        --highcharts-highlight-color-20: #ccd3ff;
        --highcharts-highlight-color-10: #e6e9ff;
      }

      .evolution-container.highcharts-dark {
        --highcharts-background-color: #1c1c1e;
        --highcharts-color-0: #67b7dc;
        --highcharts-color-1: #6794dc;
        --highcharts-color-2: #6771dc;
        --highcharts-color-3: #8067dc;
        --highcharts-color-4: #a367dc;
        --highcharts-color-5: #c767dc;
        --highcharts-color-6: #dc67ce;
        --highcharts-color-7: #dc67ab;
        --highcharts-color-8: #dc6788;
        --highcharts-color-9: #dc6967;
        --highcharts-neutral-color-100: #ffffff;
        --highcharts-neutral-color-80: #d9d9d9;
        --highcharts-neutral-color-60: #b3b3b3;
        --highcharts-neutral-color-40: #808080;
        --highcharts-neutral-color-20: #4d4d4d;
        --highcharts-neutral-color-10: #333333;
        --highcharts-neutral-color-5: #1a1a1a;
        --highcharts-neutral-color-3: #0d0d0d;
        --highcharts-highlight-color-100: #88b7ff;
        --highcharts-highlight-color-80: #99c3ff;
        --highcharts-highlight-color-60: #aacfff;
        --highcharts-highlight-color-20: #cce3ff;
        --highcharts-highlight-color-10: #e6f1ff;
      }

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: var(--_bg);
        border-bottom: 1px solid rgba(128, 128, 128, 0.2);
      }

      .symbol-info {
        display: flex;
        align-items: baseline;
        gap: 1rem;
      }

      .symbol {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--_text);
      }

      .price {
        font-size: 1.25rem;
        font-weight: 600;
      }

      .price.up {
        color: #22c55e;
      }

      .price.down {
        color: #ef4444;
      }

      .change {
        font-size: 0.875rem;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
      }

      .change.up {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }

      .change.down {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
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
  }

  private isDarkMode(): boolean {
    return (
      this.theme === 'dark' ||
      (this.theme === 'auto' &&
        (document.documentElement.classList.contains('dark') ||
          document.body.classList.contains('dark')))
    );
  }

  protected override updateTheme(): void {
    const container = this.containerRef.value;
    if (!container) return;

    const isDark = this.isDarkMode();
    const primaryColor = isDark ? '#0a84ff' : '#0071e3';

    // Apply theme class to container - CSS custom properties will cascade to chart
    container.classList.toggle('highcharts-dark', isDark);
    container.classList.toggle('highcharts-light', !isDark);

    // Force chart to re-read CSS custom property values
    if (this.chart) {
      // Save zoom state
      const xAxis = this.chart.xAxis[0];
      const extremes = xAxis?.getExtremes();

      // Update button theme colors for new theme, and trigger redraw
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
        true,
        true,
        false
      );

      // Restore zoom state
      if (xAxis && extremes && extremes.userMin !== undefined) {
        xAxis.setExtremes(extremes.userMin, extremes.userMax, true, false);
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
    const isDark = this.isDarkMode();
    container.classList.toggle('highcharts-dark', isDark);
    container.classList.toggle('highcharts-light', !isDark);

    const cfg = this.config;
    const primaryColor = isDark ? '#0a84ff' : '#0071e3';
    const eventColors = cfg.eventColors ?? DEFAULT_EVENT_COLORS;

    // Transform price data
    const priceData = this.prices.map((p) => [p.time, p.price]);
    const volumeData = this.prices.map((p) => [p.time, p.volume ?? 0]);

    // Set last price for header
    const lastPoint = this.prices[this.prices.length - 1];
    if (lastPoint) {
      this.lastPrice = lastPoint.price;
    }

    // Helper to find price at a given date
    const findPriceAtDate = (timestamp: number): number => {
      // Find closest price point
      let closest = this.prices[0];
      let minDiff = Math.abs(timestamp - (closest?.time ?? 0));
      for (const p of this.prices) {
        const diff = Math.abs(timestamp - p.time);
        if (diff < minDiff) {
          minDiff = diff;
          closest = p;
        }
      }
      return closest?.price ?? 0;
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

  private getChangeInfo() {
    if (this.prices.length < 2) return { change: 0, percent: 0, direction: 'up' as const };

    const first = this.prices[0]!;
    const last = this.prices[this.prices.length - 1]!;
    const change = last.price - first.price;
    const percent = (change / first.price) * 100;

    return {
      change,
      percent,
      direction: change >= 0 ? ('up' as const) : ('down' as const),
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
    const { change, percent, direction } = this.getChangeInfo();
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
