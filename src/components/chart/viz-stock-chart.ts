import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ref } from 'lit/directives/ref.js';
import Highcharts from 'highcharts/highstock';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import 'highcharts/themes/adaptive';
import { VizStockChartBase } from '../../base/viz-stock-chart-base.js';
import { highchartsThemeStyles } from '../../styles/highcharts-theme.js';
import { chartHeaderStyles } from '../../styles/chart-header.js';
import { generateOHLCData } from '../../utils/sample-data.js';
import type { OHLCDataPoint, StockChartConfig } from '../../types/index.js';

// Initialize Highcharts modules
if (typeof HighchartsAccessibility === 'function') {
  (HighchartsAccessibility as unknown as (hc: typeof Highcharts) => void)(Highcharts);
}

/**
 * Advanced stock chart with candlesticks, volume, and technical indicators
 * Demonstrates Highcharts Stock power with real-time updates
 */
@customElement('viz-stock-chart')
export class VizStockChart extends VizStockChartBase {
  @property({ type: Array })
  data: OHLCDataPoint[] = [];

  @property({ type: Object })
  config: StockChartConfig = {};

  private realtimeTimer: ReturnType<typeof setInterval> | null = null;

  static override styles = [
    ...VizStockChartBase.styles,
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

  protected override getWatchedProperties(): string[] {
    return ['config', 'theme', 'demo'];
  }

  protected override loadDemoData(): void {
    if (this.data.length > 0) return;
    this.data = generateOHLCData(100);
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);

    // Update cached change info when data changes
    if (changedProperties.has('data')) {
      this.updateCachedChangeInfo();
    }

    // Handle realtime toggle
    if (this.config.realtime && !this.realtimeTimer) {
      this.startRealtime();
    } else if (!this.config.realtime && this.realtimeTimer) {
      this.stopRealtime();
    }
  }

  override disconnectedCallback(): void {
    this.stopRealtime();
    super.disconnectedCallback();
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

    // Efficient array management
    if (this.data.length >= 500) {
      this.data.shift();
    }
    this.data.push(newPoint);
    this.lastPrice = close;

    this.updateCachedChangeInfo();

    // Update chart with animation
    ohlcSeries.addPoint([time, open, high, low, close], true, true, true);
    if (volumeSeries && this.config.showVolume !== false) {
      volumeSeries.addPoint([time, volume], true, true, false);
    }

    // Dispatch event
    this.dispatchEvent(
      new CustomEvent('price-update', {
        detail: { ...newPoint, change: close - open, changePercent: ((close - open) / open) * 100 },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override updateChart(): void {
    const container = this.containerRef.value;
    if (!container || this.data.length === 0) return;

    this.applyHighchartsThemeClass(container);

    const cfg = this.config;
    const lastPoint = this.data[this.data.length - 1];
    if (lastPoint) this.lastPrice = lastPoint.close;

    // Transform data to Highcharts format
    const ohlcData = this.data.map((d) => [d.time, d.open, d.high, d.low, d.close]);
    const volumeData = this.data.map((d) => [d.time, d.volume ?? 0]);

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
        tooltip: { valueDecimals: 2, valuePrefix: cfg.currency ?? '$' },
      },
    ];

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

    const options: Highcharts.Options = {
      chart: { style: { fontFamily: 'inherit' }, animation: true },
      title: { text: '' },
      rangeSelector: {
        ...(this.chart ? {} : { selected: 1 }),
        buttons: this.buildShortTermButtons(),
        buttonTheme: this.buildRangeSelectorButtonTheme(),
      },
      navigator: { enabled: true },
      scrollbar: { enabled: true },
      xAxis: {
        type: 'datetime',
        gridLineWidth: 1,
        crosshair: {
          dashStyle: 'Dash',
          label: { enabled: true, style: { color: '#ffffff' } },
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
          labels: { align: 'right', x: -5 },
          top: '75%',
          height: '25%',
          offset: 0,
          lineWidth: 1,
        },
      ],
      tooltip: { split: true, shadow: true },
      plotOptions: {
        candlestick: { lineWidth: 1 },
        series: { animation: { duration: 300 } },
      },
      series,
      credits: { enabled: false },
      ...cfg.highcharts,
    };

    if (this.chart) {
      this.preserveExtremesAndUpdate(() => {
        this.chart!.update(options, true, true);
      });
    } else {
      this.chart = Highcharts.stockChart(container, options);
    }
  }

  private updateCachedChangeInfo(): void {
    if (this.data.length < 2) {
      this.cachedChangeInfo = { change: 0, percent: 0, direction: 'up' };
      return;
    }

    const current = this.data[this.data.length - 1];
    const previous = this.data[this.data.length - 2];
    if (!current || !previous) return;

    this.cachedChangeInfo = this.calculateChange(current.close, previous.close);
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
      const ohlcSeries = this.chart.get('ohlc') as Highcharts.Series | undefined;
      const volumeSeries = this.chart.get('volume') as Highcharts.Series | undefined;

      ohlcSeries?.addPoint([point.time, point.open, point.high, point.low, point.close], true, true, true);
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
