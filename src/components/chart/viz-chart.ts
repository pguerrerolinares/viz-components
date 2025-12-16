import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import Highcharts from 'highcharts';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import { VizBaseComponent } from '../../base/viz-base-component.js';

// Initialize accessibility module
if (typeof HighchartsAccessibility === 'function') {
  (HighchartsAccessibility as unknown as (hc: typeof Highcharts) => void)(Highcharts);
}
import type { ChartType, ChartSeries, ChartConfig } from '../../types/index.js';

/**
 * Universal chart component wrapping Highcharts
 * Supports line, bar, column, pie, and area charts
 */
@customElement('viz-chart')
export class VizChart extends VizBaseComponent {
  @property({ type: String })
  type: ChartType = 'line';

  @property({ type: Array })
  data: ChartSeries[] = [];

  @property({ type: Object })
  config: ChartConfig = {};

  @property({ type: Array })
  categories: string[] = [];

  private chart: Highcharts.Chart | null = null;
  private containerRef = createRef<HTMLDivElement>();

  static override styles = [
    ...VizBaseComponent.styles,
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

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  protected override updated(): void {
    this.updateChart();
  }

  private updateChart(): void {
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
              click: (e) => this.emitEvent('point-click', e),
            },
          },
          events: {
            click: (e) => this.emitEvent('series-click', e),
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
    };

    if (this.chart) {
      this.chart.update(options, true, true);
    } else {
      this.chart = Highcharts.chart(container, options);
    }
  }

  private emitEvent(
    name: string,
    e: Highcharts.PointClickEventObject | Highcharts.SeriesClickEventObject
  ): void {
    this.dispatchEvent(
      new CustomEvent(name, {
        detail: {
          point: 'point' in e ? e.point : null,
          series: e.target,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    return html`<div class="chart-container" ${ref(this.containerRef)}></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'viz-chart': VizChart;
  }
}
