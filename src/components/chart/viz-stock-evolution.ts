import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ref } from 'lit/directives/ref.js';
import Highcharts from 'highcharts/highstock';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import 'highcharts/themes/adaptive';

import { VizStockChartBase } from '../../base/viz-stock-chart-base.js';
import { highchartsThemeStyles } from '../../styles/highcharts-theme.js';
import { chartHeaderStyles } from '../../styles/chart-header.js';
import { generateHistoricalPrices, getMarketEvents } from '../../utils/sample-data.js';
import { DEFAULT_EVENT_COLORS } from '../../utils/market-event-constants.js';
import { createMarkerSvg, getMarkerHeight, STEM_HEIGHTS } from '../../utils/market-event-icons.js';
import { calculateFlagStemHeights } from '../../utils/flag-layout.js';
import './viz-event-modal.js';

import type {
  PriceDataPoint,
  MarketEvent,
  StockEvolutionConfig,
} from '../../types/index.js';

// Initialize Highcharts modules
if (typeof HighchartsAccessibility === 'function') {
  (HighchartsAccessibility as unknown as (hc: typeof Highcharts) => void)(Highcharts);
}


/**
 * Stock Evolution Chart Component
 * Shows historical price evolution with major market event flags
 */
@customElement('viz-stock-evolution')
export class VizStockEvolution extends VizStockChartBase {
  /** Chart configuration options */
  @property({ type: Object })
  config: StockEvolutionConfig = {};

  /** Price data points array */
  @property({ type: Array })
  prices: PriceDataPoint[] = [];

  /** Market events to display as flags */
  @property({ type: Array })
  events: MarketEvent[] = [];

  @state()
  private selectedEvent: MarketEvent | null = null;

  static override styles = [
    ...VizStockChartBase.styles,
    highchartsThemeStyles,
    chartHeaderStyles,
    css`
      .evolution-container {
        min-height: 400px;
      }
    `,
  ];

  protected override getWatchedProperties(): string[] {
    return ['prices', 'events', 'config', 'theme', 'demo'];
  }

  protected override loadDemoData(): void {
    if (this.prices.length > 0) return;
    this.prices = generateHistoricalPrices();
    this.events = getMarketEvents();
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);

    if (changedProperties.has('prices')) {
      this.updateChangeInfo();
    }
  }

  private updateChangeInfo(): void {
    if (this.prices.length < 2) {
      this.cachedChangeInfo = { change: 0, percent: 0, direction: 'up' };
      return;
    }

    const first = this.prices[0];
    const last = this.prices[this.prices.length - 1];
    if (!first || !last) return;

    this.cachedChangeInfo = this.calculateChange(last.price, first.price);
  }

  /** Binary search to find price at a given timestamp - O(log n) */
  private findPriceAtDate(timestamp: number): number {
    if (this.prices.length === 0) return 0;

    let left = 0;
    let right = this.prices.length - 1;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (this.prices[mid]!.time < timestamp) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    const leftPrice = this.prices[left];
    const prevPrice = this.prices[left - 1];

    if (!leftPrice) return this.prices[0]?.price ?? 0;
    if (!prevPrice) return leftPrice.price;

    return Math.abs(timestamp - leftPrice.time) < Math.abs(timestamp - prevPrice.time)
      ? leftPrice.price
      : prevPrice.price;
  }

  /** Get price range for calculating proportional stem heights */
  private getPriceRange(): number {
    if (this.prices.length === 0) return 100;
    let min = Infinity;
    let max = -Infinity;
    for (const p of this.prices) {
      if (p.price < min) min = p.price;
      if (p.price > max) max = p.price;
    }
    return max - min || 1;
  }

  /** Calculate stem heights for events using collision avoidance */
  private calculateEventStemHeights(): Map<number, number> {
    if (this.events.length === 0) return new Map();

    const eventsWithPosition = this.events.map((event, index) => ({
      date: event.date,
      index,
      basePrice: this.findPriceAtDate(event.date),
    }));

    return calculateFlagStemHeights(eventsWithPosition, this.getPriceRange());
  }

  /** Build events scatter series data */
  private buildEventsData(): Highcharts.PointOptionsObject[] {
    if (this.config.showEvents === false) return [];

    const eventColors = this.config.eventColors ?? DEFAULT_EVENT_COLORS;
    const stemHeights = this.calculateEventStemHeights();

    return this.events.map((event, index) => {
      const stemHeight = stemHeights.get(index) ?? STEM_HEIGHTS.medium;
      return {
        x: event.date,
        y: this.findPriceAtDate(event.date),
        name: event.title,
        marker: {
          symbol: createMarkerSvg(event.type, eventColors[event.type], stemHeight),
          width: 32,
          height: getMarkerHeight(stemHeight),
        },
        custom: { eventIndex: index },
      };
    });
  }

  /** Build chart series configuration */
  private buildSeries(): Highcharts.SeriesOptionsType[] {
    const cfg = this.config;
    const areaColor = cfg.areaColor ?? '#2caffe';

    const series: Highcharts.SeriesOptionsType[] = [
      {
        type: 'area',
        id: 'price',
        name: cfg.symbol ?? 'S&P 500',
        data: this.prices.map((p) => [p.time, p.price]),
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
        tooltip: { valueDecimals: 2, valuePrefix: cfg.currency ?? '$' },
      } as Highcharts.SeriesAreaOptions,
    ];

    const eventsData = this.buildEventsData();
    if (eventsData.length > 0) {
      series.push({
        type: 'scatter',
        id: 'events',
        name: 'Market Events',
        data: eventsData,
        marker: { enabled: true },
        findNearestPointBy: 'xy',
        stickyTracking: false,
        states: {
          hover: { enabled: true, halo: { size: 12, opacity: 0.2 } },
          inactive: { opacity: 1 },
        },
        cursor: 'pointer',
        point: {
          events: {
            click: (e: Highcharts.PointClickEventObject) => {
              const point = e.point as Highcharts.Point & { custom?: { eventIndex: number } };
              const idx = point.custom?.eventIndex;
              if (idx !== undefined) this.selectedEvent = this.events[idx] ?? null;
            },
          },
        },
        tooltip: { pointFormat: '<b>{point.name}</b><br/><span style="color:#888">Click for details</span>' },
        zIndex: 10,
        enableMouseTracking: true,
        boostThreshold: 0,
      } as Highcharts.SeriesScatterOptions);
    }

    if (cfg.showVolume) {
      series.push({
        type: 'column',
        id: 'volume',
        name: 'Volume',
        data: this.prices.map((p) => [p.time, p.volume ?? 0]),
        yAxis: 1,
      } as Highcharts.SeriesColumnOptions);
    }

    return series;
  }

  /** Build Y-axis configuration */
  private buildYAxis(): Highcharts.YAxisOptions[] {
    const cfg = this.config;
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
        labels: { align: 'right', x: -5 },
        top: '75%',
        height: '25%',
        offset: 0,
        lineWidth: 1,
      });
    }

    return yAxis;
  }

  protected override updateChart(): void {
    const container = this.containerRef.value;
    if (!container || this.prices.length === 0) return;

    this.applyHighchartsThemeClass(container);

    const cfg = this.config;
    const lastPoint = this.prices[this.prices.length - 1];
    if (lastPoint) this.lastPrice = lastPoint.price;

    const options: Highcharts.Options = {
      chart: { style: { fontFamily: 'inherit' }, animation: true },
      title: { text: cfg.title ?? '' },
      ...(this.chart
        ? {}
        : {
            rangeSelector: {
              selected: 4,
              buttons: this.buildLongTermButtons(),
              buttonTheme: this.buildRangeSelectorButtonTheme(),
            },
          }),
      navigator: { enabled: true },
      scrollbar: { enabled: true },
      xAxis: { type: 'datetime', gridLineWidth: 1 },
      yAxis: this.buildYAxis(),
      tooltip: { split: false, shared: true, shadow: true, snap: 30 },
      plotOptions: {
        area: {
          marker: {
            enabled: false,
            states: { hover: { enabled: true, radius: 5 } },
          },
        },
        series: { animation: { duration: 500 } },
        scatter: {
          marker: { states: { hover: { enabled: true, radiusPlus: 4 } } },
          crisp: false,
        },
      },
      series: this.buildSeries(),
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
          ${this.demo ? 'Demo data' : ''}${this.events.length > 0 ? ` · ${this.events.length} events` : ''}
        </div>
      </div>
      <div class="evolution-container" part="chart" ${ref(this.containerRef)}></div>
      <viz-event-modal
        .event=${this.selectedEvent}
        @close=${() => (this.selectedEvent = null)}
      ></viz-event-modal>
    `;
  }

  /** Set price and event data programmatically */
  setData(prices: PriceDataPoint[], events?: MarketEvent[]): void {
    this.prices = prices;
    if (events) this.events = events;
  }

  /** Add a single event */
  addEvent(event: MarketEvent): void {
    this.events = [...this.events, event];
  }
}

export type { PriceDataPoint, MarketEvent, StockEvolutionConfig };

declare global {
  interface HTMLElementTagNameMap {
    'viz-stock-evolution': VizStockEvolution;
  }
}
