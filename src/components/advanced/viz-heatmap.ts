import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import Highcharts from 'highcharts';
import HighchartsHeatmap from 'highcharts/modules/heatmap';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import { VizBaseComponent } from '../../base/viz-base-component.js';
import type { HeatmapDataPoint, HeatmapConfig } from '../../types/index.js';

// Initialize Highcharts modules
if (typeof HighchartsHeatmap === 'function') {
  (HighchartsHeatmap as unknown as (hc: typeof Highcharts) => void)(Highcharts);
}
if (typeof HighchartsAccessibility === 'function') {
  (HighchartsAccessibility as unknown as (hc: typeof Highcharts) => void)(Highcharts);
}

/**
 * Heatmap visualization component
 * Displays data intensity in a grid format
 */
@customElement('viz-heatmap')
export class VizHeatmap extends VizBaseComponent {
  @property({ type: Array })
  data: HeatmapDataPoint[] = [];

  @property({ type: Object })
  config: HeatmapConfig = {};

  @property({ type: String, attribute: 'title' })
  chartTitle = '';

  @property({ type: Array, attribute: 'x-categories' })
  xCategories: string[] = [];

  @property({ type: Array, attribute: 'y-categories' })
  yCategories: string[] = [];

  private chart: Highcharts.Chart | null = null;
  private containerRef = createRef<HTMLDivElement>();

  static override styles = [
    ...VizBaseComponent.styles,
    css`
      :host {
        display: block;
        min-height: 300px;
      }

      .heatmap-container {
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
    const cfg = this.config;

    // Merge x/y categories from attributes or config
    const xCats =
      this.xCategories.length > 0 ? this.xCategories : cfg.xCategories;
    const yCats =
      this.yCategories.length > 0 ? this.yCategories : cfg.yCategories;

    // Transform data to Highcharts format
    const seriesData = this.data.map((point) => [point.x, point.y, point.value]);

    const options: Highcharts.Options = {
      chart: {
        type: 'heatmap',
        backgroundColor: theme.background,
        style: { fontFamily: 'inherit' },
      },
      title: {
        text: this.chartTitle || undefined,
        style: { color: theme.text },
      },
      xAxis: {
        categories: xCats,
        labels: { style: { color: theme.text } },
      },
      yAxis: {
        categories: yCats,
        title: { text: '' },
        labels: { style: { color: theme.text } },
        reversed: true,
      },
      colorAxis: {
        min: cfg.colorAxis?.min ?? 0,
        max: cfg.colorAxis?.max,
        stops: cfg.colorAxis?.stops ?? [
          [0, '#ffffff'],
          [0.5, theme.primary],
          [1, '#000000'],
        ],
      },
      legend: {
        align: 'right',
        layout: 'vertical',
        verticalAlign: 'middle',
      },
      series: [
        {
          type: 'heatmap',
          name: 'Value',
          data: seriesData,
          dataLabels: {
            enabled: true,
            color: theme.text,
          },
        } as Highcharts.SeriesHeatmapOptions,
      ],
      credits: { enabled: false },
    };

    if (this.chart) {
      this.chart.update(options, true, true);
    } else {
      this.chart = Highcharts.chart(container, options);
    }
  }

  protected override render() {
    return html`<div class="heatmap-container" ${ref(this.containerRef)}></div>`;
  }

  /**
   * Programmatic API
   */
  setData(data: HeatmapDataPoint[]): void {
    this.data = data;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'viz-heatmap': VizHeatmap;
  }
}
