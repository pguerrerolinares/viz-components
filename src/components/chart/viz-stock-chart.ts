import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import Highcharts from 'highcharts/highstock';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import 'highcharts/themes/adaptive';
import { VizBaseComponent } from '../../base/viz-base-component.js';

// Initialize Highcharts modules
if (typeof HighchartsAccessibility === 'function') {
  (HighchartsAccessibility as unknown as (hc: typeof Highcharts) => void)(Highcharts);
}

export interface OHLCDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface StockChartConfig {
  title?: string;
  symbol?: string;
  currency?: string;
  showVolume?: boolean;
  realtime?: boolean;
  realtimeInterval?: number;
  highcharts?: Record<string, unknown>;
}

/**
 * Advanced stock chart with candlesticks, volume, and technical indicators
 * Demonstrates Highcharts Stock power with real-time updates
 */
@customElement('viz-stock-chart')
export class VizStockChart extends VizBaseComponent {
  @property({ type: Array })
  data: OHLCDataPoint[] = [];

  @property({ type: Object })
  config: StockChartConfig = {};

  // theme property inherited from VizBaseComponent

  private chart: Highcharts.Chart | null = null;
  private containerRef = createRef<HTMLDivElement>();
  // themeObserver inherited from VizBaseComponent
  private realtimeTimer: ReturnType<typeof setInterval> | null = null;
  private lastPrice = 0;

  static override styles = [
    ...VizBaseComponent.styles,
    css`
      :host {
        display: block;
        min-height: 500px;
      }

      .stock-chart-container {
        width: 100%;
        height: 500px;
      }

      /* Highcharts adaptive theme CSS custom properties - defined on container to override :root */
      .stock-chart-container.highcharts-light {
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

      .stock-chart-container.highcharts-dark {
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

      .live-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: var(--_text);
        opacity: 0.7;
      }

      .live-dot {
        width: 8px;
        height: 8px;
        background: #22c55e;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `,
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    this.setupThemeObserver();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.stopRealtime();
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.cleanupThemeObserver();
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    // Only create/update chart when needed, not for every data change
    // Realtime updates use addPoint() directly, so we skip updateChart() for data-only changes
    const needsChartUpdate =
      !this.chart ||
      changedProperties.has('config') ||
      changedProperties.has('theme') ||
      (changedProperties.has('data') && !this.realtimeTimer);

    if (needsChartUpdate) {
      this.updateChart();
    }

    if (this.config.realtime && !this.realtimeTimer) {
      this.startRealtime();
    } else if (!this.config.realtime && this.realtimeTimer) {
      this.stopRealtime();
    }
  }

  // setupThemeObserver() inherited from VizBaseComponent with debouncing

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

    // Apply theme class to container - CSS custom properties will cascade to chart
    container.classList.toggle('highcharts-dark', isDark);
    container.classList.toggle('highcharts-light', !isDark);

    // Force chart to re-read CSS custom property values
    if (this.chart) {
      // Save zoom state
      const xAxis = this.chart.xAxis[0];
      const extremes = xAxis?.getExtremes();

      // Trigger redraw to pick up new CSS variable values
      this.chart.update({}, true, true, false);

      // Restore zoom state
      if (xAxis && extremes && extremes.userMin !== undefined) {
        xAxis.setExtremes(extremes.userMin, extremes.userMax, true, false);
      }
    }
  }

  private startRealtime(): void {
    const interval = this.config.realtimeInterval ?? 1000;
    this.realtimeTimer = setInterval(() => {
      this.addRealtimePoint();
    }, interval);
  }

  private stopRealtime(): void {
    if (this.realtimeTimer) {
      clearInterval(this.realtimeTimer);
      this.realtimeTimer = null;
    }
  }

  private addRealtimePoint(): void {
    if (!this.chart) return;

    const ohlcSeries = this.chart.series[0];
    const volumeSeries = this.chart.series[1];
    if (!ohlcSeries) return;

    const lastPoint = this.data[this.data.length - 1];
    if (!lastPoint) return;

    // Simulate realistic price movement
    const volatility = 0.002;
    const trend = Math.random() > 0.48 ? 1 : -1;
    const change = lastPoint.close * volatility * trend * Math.random();

    const time = Date.now();
    const open = lastPoint.close;
    const close = open + change;
    const high = Math.max(open, close) + Math.abs(change) * Math.random();
    const low = Math.min(open, close) - Math.abs(change) * Math.random();
    const volume = Math.floor((lastPoint.volume ?? 1000000) * (0.8 + Math.random() * 0.4));

    const newPoint: OHLCDataPoint = { time, open, high, low, close, volume };
    this.data = [...this.data.slice(-500), newPoint];
    this.lastPrice = close;

    // Update chart with animation
    ohlcSeries.addPoint([time, open, high, low, close], true, true, true);
    if (volumeSeries && this.config.showVolume !== false) {
      volumeSeries.addPoint([time, volume], true, true, false);
    }

    // Dispatch event for parent to react
    this.dispatchEvent(
      new CustomEvent('price-update', {
        detail: { ...newPoint, change: close - open, changePercent: ((close - open) / open) * 100 },
        bubbles: true,
        composed: true,
      })
    );
  }

  private updateChart(): void {
    const container = this.containerRef.value;
    if (!container || this.data.length === 0) return;

    // Apply initial theme class to container
    const isDark = this.isDarkMode();
    container.classList.toggle('highcharts-dark', isDark);
    container.classList.toggle('highcharts-light', !isDark);

    const cfg = this.config;
    const primaryColor = isDark ? '#0a84ff' : '#0071e3';

    // Transform data to Highcharts format
    const ohlcData = this.data.map((d) => [d.time, d.open, d.high, d.low, d.close]);
    const volumeData = this.data.map((d) => [d.time, d.volume ?? 0]);

    // Set last price for header
    const lastPoint = this.data[this.data.length - 1];
    if (lastPoint) {
      this.lastPrice = lastPoint.close;
    }

    const series: Highcharts.SeriesOptionsType[] = [
      {
        type: 'candlestick',
        id: 'ohlc',
        name: cfg.symbol ?? 'Price',
        data: ohlcData,
        color: '#ef4444',
        upColor: '#22c55e',
        lineColor: '#ef4444',
        upLineColor: '#22c55e',
        tooltip: {
          valueDecimals: 2,
          valuePrefix: cfg.currency ?? '$',
        },
      },
    ];

    // Volume series
    if (cfg.showVolume !== false) {
      series.push({
        type: 'column',
        id: 'volume',
        name: 'Volume',
        data: volumeData,
        yAxis: 1,
        color: 'rgba(100, 100, 100, 0.5)',
      });
    }

    // Let adaptive theme handle colors via CSS custom properties
    const options: Highcharts.Options = {
      chart: {
        style: { fontFamily: 'inherit' },
        animation: true,
      },
      title: { text: '' },
      rangeSelector: {
        // Only set selected on initial creation, not on updates (to preserve user selection)
        ...(this.chart ? {} : { selected: 1 }),
        buttons: [
          { type: 'hour', count: 1, text: '1H' },
          { type: 'day', count: 1, text: '1D' },
          { type: 'week', count: 1, text: '1W' },
          { type: 'month', count: 1, text: '1M' },
          { type: 'month', count: 3, text: '3M' },
          { type: 'year', count: 1, text: '1Y' },
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
      navigator: {
        enabled: true,
      },
      scrollbar: {
        enabled: true,
      },
      xAxis: {
        type: 'datetime',
        gridLineWidth: 1,
        crosshair: {
          dashStyle: 'Dash',
          label: {
            enabled: true,
            style: { color: '#ffffff' },
          },
        },
      },
      yAxis: [
        {
          labels: {
            align: 'right',
            x: -5,
            formatter: function () {
              return (cfg.currency ?? '$') + Highcharts.numberFormat(this.value as number, 2);
            },
          },
          height: '70%',
          lineWidth: 1,
          crosshair: {
            dashStyle: 'Dash',
            label: {
              enabled: true,
              style: { color: '#ffffff' },
              format: (cfg.currency ?? '$') + '{value:.2f}',
            },
          },
        },
        {
          labels: {
            align: 'right',
            x: -5,
          },
          top: '75%',
          height: '25%',
          offset: 0,
          lineWidth: 1,
        },
      ],
      tooltip: {
        split: true,
        shadow: true,
      },
      plotOptions: {
        candlestick: {
          lineWidth: 1,
        },
        series: {
          animation: { duration: 300 },
        },
      },
      series,
      credits: { enabled: false },
      ...cfg.highcharts,
    };

    if (this.chart) {
      this.chart.update(options, true, true);
    } else {
      this.chart = Highcharts.stockChart(container, options);
    }
  }

  private getChangeInfo() {
    if (this.data.length < 2) return { change: 0, percent: 0, direction: 'up' as const };

    const current = this.data[this.data.length - 1]!;
    const previous = this.data[this.data.length - 2]!;
    const change = current.close - previous.close;
    const percent = (change / previous.close) * 100;

    return {
      change,
      percent,
      direction: change >= 0 ? 'up' as const : 'down' as const,
    };
  }

  protected override render() {
    const { change, percent, direction } = this.getChangeInfo();
    const cfg = this.config;

    return html`
      <div class="chart-header" part="header">
        <div class="symbol-info">
          <span class="symbol" part="symbol">${cfg.symbol ?? 'STOCK'}</span>
          <span class="price ${direction}" part="price">
            ${cfg.currency ?? '$'}${this.lastPrice.toFixed(2)}
          </span>
          <span class="change ${direction}" part="change">
            ${direction === 'up' ? '+' : ''}${change.toFixed(2)} (${direction === 'up' ? '+' : ''}${percent.toFixed(2)}%)
          </span>
        </div>
        ${cfg.realtime
          ? html`
              <div class="live-indicator" part="live-indicator">
                <div class="live-dot"></div>
                LIVE
              </div>
            `
          : ''}
      </div>
      <div class="stock-chart-container" part="chart" ${ref(this.containerRef)}></div>
    `;
  }

  /**
   * Programmatic API
   */
  addPoint(point: OHLCDataPoint): void {
    this.data = [...this.data, point];
    this.lastPrice = point.close;

    if (this.chart) {
      const ohlcSeries = this.chart.series[0];
      const volumeSeries = this.chart.series[1];

      ohlcSeries?.addPoint([point.time, point.open, point.high, point.low, point.close], true, true, true);
      if (volumeSeries && point.volume) {
        volumeSeries.addPoint([point.time, point.volume], true, true, false);
      }
    }
  }

  setData(data: OHLCDataPoint[]): void {
    this.data = data;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'viz-stock-chart': VizStockChart;
  }
}
