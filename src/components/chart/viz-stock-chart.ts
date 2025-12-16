import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import Highcharts from 'highcharts/highstock';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import 'highcharts/themes/adaptive';
import { VizBaseComponent } from '../../base/viz-base-component.js';
import { highchartsThemeStyles } from '../../styles/highcharts-theme.js';
import { chartHeaderStyles } from '../../styles/chart-header.js';

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

  /** Cached change info to avoid recalculation on every render */
  @state()
  private cachedChangeInfo: { change: number; percent: number; direction: 'up' | 'down' } = {
    change: 0,
    percent: 0,
    direction: 'up',
  };

  static override styles = [
    ...VizBaseComponent.styles,
    highchartsThemeStyles,
    chartHeaderStyles,
    css`
      :host {
        display: block;
        min-height: 500px;
      }

      .stock-chart-container {
        width: 100%;
        height: 500px;
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

    // Update cached change info when data changes
    if (changedProperties.has('data')) {
      this.updateCachedChangeInfo();
    }

    if (this.config.realtime && !this.realtimeTimer) {
      this.startRealtime();
    } else if (!this.config.realtime && this.realtimeTimer) {
      this.stopRealtime();
    }
  }

  // isDarkMode(), getPrimaryColor(), applyHighchartsThemeClass() inherited from VizBaseComponent

  protected override updateTheme(): void {
    const container = this.containerRef.value;
    if (!container) return;

    // Apply theme class to container - CSS custom properties will cascade to chart
    this.applyHighchartsThemeClass(container);

    // Force chart to re-read CSS custom property values
    if (this.chart) {
      // Save zoom state
      const xAxis = this.chart.xAxis[0];
      const extremes = xAxis?.getExtremes();

      // Batch: suppress redraw on update, let setExtremes handle final redraw
      this.chart.update({}, false, false, false);

      // Restore zoom state with single redraw
      if (xAxis && extremes && extremes.userMin !== undefined) {
        xAxis.setExtremes(extremes.userMin, extremes.userMax, true, false);
      } else {
        this.chart.redraw();
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

    // Use series IDs instead of indices for robustness
    const ohlcSeries = this.chart.get('ohlc') as Highcharts.Series | undefined;
    const volumeSeries = this.chart.get('volume') as Highcharts.Series | undefined;
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

    // Efficient array management: shift+push instead of slice+spread
    if (this.data.length >= 500) {
      this.data.shift();
    }
    this.data.push(newPoint);
    this.lastPrice = close;

    // Update cached change info
    this.updateCachedChangeInfo();

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
    this.applyHighchartsThemeClass(container);

    const cfg = this.config;
    const primaryColor = this.getPrimaryColor();

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

  /** Updates the cached change info - called when data changes */
  private updateCachedChangeInfo(): void {
    if (this.data.length < 2) {
      this.cachedChangeInfo = { change: 0, percent: 0, direction: 'up' };
      return;
    }

    const current = this.data[this.data.length - 1];
    const previous = this.data[this.data.length - 2];
    if (!current || !previous) {
      this.cachedChangeInfo = { change: 0, percent: 0, direction: 'up' };
      return;
    }

    const change = current.close - previous.close;
    const percent = (change / previous.close) * 100;

    this.cachedChangeInfo = {
      change,
      percent,
      direction: change >= 0 ? 'up' : 'down',
    };
  }

  protected override render() {
    const { change, percent, direction } = this.cachedChangeInfo;
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
    this.updateCachedChangeInfo();

    if (this.chart) {
      // Use series IDs instead of indices for robustness
      const ohlcSeries = this.chart.get('ohlc') as Highcharts.Series | undefined;
      const volumeSeries = this.chart.get('volume') as Highcharts.Series | undefined;

      ohlcSeries?.addPoint([point.time, point.open, point.high, point.low, point.close], true, true, true);
      // Respect showVolume config (consistent with addRealtimePoint)
      if (volumeSeries && point.volume && this.config.showVolume !== false) {
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
