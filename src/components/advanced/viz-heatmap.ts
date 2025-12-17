import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ref } from 'lit/directives/ref.js';
import Highcharts from 'highcharts/highstock';
import HighchartsHeatmap from 'highcharts/modules/heatmap';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import { VizHighchartsComponent } from '../../base/viz-highcharts-component.js';
import { generateHeatmapData } from '../../utils/sample-data.js';
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
export class VizHeatmap extends VizHighchartsComponent {
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

  static override styles = [
    ...VizHighchartsComponent.styles,
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

  protected override getWatchedProperties(): string[] {
    return ['data', 'config', 'chartTitle', 'xCategories', 'yCategories', 'theme', 'demo'];
  }

  protected override loadDemoData(): void {
    if (this.data.length > 0) return;
    const demoData = generateHeatmapData();
    this.data = demoData.data;
    this.xCategories = demoData.xCategories;
    this.yCategories = demoData.yCategories;
  }

  protected override updateChart(): void {
    const container = this.containerRef.value;
    if (!container || this.data.length === 0) return;

    const theme = this.getThemeColors();
    const cfg = this.config;

    // Merge x/y categories from attributes or config
    const xCats = this.xCategories.length > 0 ? this.xCategories : cfg.xCategories;
    const yCats = this.yCategories.length > 0 ? this.yCategories : cfg.yCategories;

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
      // Merge user's custom Highcharts options
      ...cfg.highcharts,
    };

    if (this.chart) {
      this.chart.update(options, true, true);
    } else {
      this.chart = Highcharts.chart(container, options);
    }
  }

  protected override render() {
    return html`<div class="heatmap-container" part="chart" ${ref(this.containerRef)}></div>`;
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
