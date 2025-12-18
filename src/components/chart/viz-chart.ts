import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ref } from 'lit/directives/ref.js';
import Highcharts from 'highcharts/highstock';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import { VizHighchartsComponent } from '../../base/viz-highcharts-component.js';
import { generateChartData } from '../../utils/sample-data.js';
import { VizEventNames } from '../../types/events.js';
import type { ChartType, ChartSeries, ChartConfig, PointClickData, SeriesClickData } from '../../types/index.js';

// Initialize accessibility module
if (typeof HighchartsAccessibility === 'function') {
  (HighchartsAccessibility as unknown as (hc: typeof Highcharts) => void)(Highcharts);
}

/**
 * Universal chart component wrapping Highcharts
 * Supports line, bar, column, pie, and area charts
 */
@customElement('viz-chart')
export class VizChart extends VizHighchartsComponent {
  @property({ type: String })
  type: ChartType = 'line';

  @property({ type: Array })
  data: ChartSeries[] = [];

  @property({ type: Object })
  config: ChartConfig = {};

  @property({ type: Array })
  categories: string[] = [];

  static override styles = [
    ...VizHighchartsComponent.styles,
    css`
      :host {
        display: block;
        min-height: 300px;
      }

      .chart-container {
        width: 100%;
        height: 100%;
        min-height: 300px;
      }
    `,
  ];

  protected override getWatchedProperties(): string[] {
    return ['type', 'data', 'config', 'categories', 'theme', 'demo'];
  }

  protected override loadDemoData(): void {
    if (this.data.length > 0) return;
    const demoData = generateChartData();
    this.data = demoData.series;
    this.categories = demoData.categories;
  }

  protected override updateChart(): void {
    const container = this.containerRef.value;
    if (!container) return;

    const theme = this.getThemeColors();

    const options: Highcharts.Options = {
      chart: {
        type: this.type === 'bar' ? 'bar' : this.type,
        backgroundColor: theme.background,
        style: { fontFamily: 'inherit' },
      },
      title: {
        text: this.config.title ?? '',
        style: { color: theme.text },
      },
      subtitle: {
        text: this.config.subtitle ?? '',
        style: { color: theme.text },
      },
      xAxis: {
        categories: this.categories.length > 0 ? this.categories : undefined,
        title: {
          text: this.config.xAxisTitle ?? '',
          style: { color: theme.text },
        },
        labels: { style: { color: theme.text } },
      },
      yAxis: {
        title: {
          text: this.config.yAxisTitle ?? '',
          style: { color: theme.text },
        },
        labels: { style: { color: theme.text } },
      },
      legend: {
        enabled: this.config.legend ?? true,
        itemStyle: { color: theme.text },
      },
      tooltip: {
        enabled: this.config.tooltip ?? true,
      },
      plotOptions: {
        series: {
          animation: this.config.animation ?? true,
          cursor: 'pointer',
          point: {
            events: {
              click: (e) => this.handlePointClick(e),
            },
          },
          events: {
            click: (e) => this.handleSeriesClick(e),
          },
        },
      },
      series: this.data.map((s, i) => ({
        ...s,
        type: s.type ?? this.type,
        color: s.color ?? theme.palette[i % theme.palette.length],
      })) as Highcharts.SeriesOptionsType[],
      colors: theme.palette,
      credits: { enabled: false },
      // Merge user's custom Highcharts options
      ...this.config.highcharts,
    };

    if (this.chart) {
      this.chart.update(options, true, true);
    } else {
      this.chart = Highcharts.chart(container, options);
    }
  }

  /**
   * Handle point click events and emit standardized event
   */
  private handlePointClick(e: Highcharts.PointClickEventObject): void {
    const data: PointClickData = {
      seriesIndex: e.point.series.index,
      pointIndex: e.point.index,
      value: e.point.y,
      category: e.point.category as string | undefined,
    };
    this.emitEvent(VizEventNames.POINT_CLICK, data);
  }

  /**
   * Handle series click events and emit standardized event
   */
  private handleSeriesClick(e: Highcharts.SeriesClickEventObject): void {
    const series = e.point?.series ?? (e.target as unknown as Highcharts.Series);
    const data: SeriesClickData = {
      seriesIndex: series.index,
      seriesName: series.name,
    };
    this.emitEvent(VizEventNames.SERIES_CLICK, data);
  }

  protected override render() {
    return html`<div class="chart-container" part="chart" ${ref(this.containerRef)}></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'viz-chart': VizChart;
  }
}
