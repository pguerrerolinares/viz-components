import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import Highcharts from 'highcharts';
import HighchartsTreemap from 'highcharts/modules/treemap';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import { VizBaseComponent } from '../../base/viz-base-component.js';
import type { TreemapNode, TreemapConfig } from '../../types/index.js';

// Initialize Highcharts modules
if (typeof HighchartsTreemap === 'function') {
  (HighchartsTreemap as unknown as (hc: typeof Highcharts) => void)(Highcharts);
}
if (typeof HighchartsAccessibility === 'function') {
  (HighchartsAccessibility as unknown as (hc: typeof Highcharts) => void)(Highcharts);
}

/**
 * Treemap visualization component
 * Displays hierarchical data as nested rectangles
 */
@customElement('viz-treemap')
export class VizTreemap extends VizBaseComponent {
  @property({ type: Array })
  data: TreemapNode[] = [];

  @property({ type: Object })
  config: TreemapConfig = {};

  @property({ type: String, attribute: 'title' })
  chartTitle = '';

  private chart: Highcharts.Chart | null = null;
  private containerRef = createRef<HTMLDivElement>();

  static override styles = [
    ...VizBaseComponent.styles,
    css`
      :host {
        display: block;
        min-height: 400px;
      }

      .treemap-container {
        width: 100%;
        height: 100%;
        min-height: 400px;
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

    if (this.data.length === 0) return;

    const theme = this.getThemeColors();
    const cfg = this.config;

    // Transform data to Highcharts format
    const seriesData = this.data.map((node, index) => ({
      id: node.id,
      name: node.name,
      value: node.value,
      parent: node.parent || undefined,
      color: node.color ?? theme.palette[index % theme.palette.length],
    }));

    const options: Highcharts.Options = {
      chart: {
        backgroundColor: theme.background,
        style: { fontFamily: 'inherit' },
      },
      title: {
        text: this.chartTitle || undefined,
        style: { color: theme.text },
      },
      series: [
        {
          type: 'treemap',
          layoutAlgorithm: cfg.layoutAlgorithm ?? 'squarified',
          allowTraversingTree: cfg.allowDrillDown ?? false,
          levelIsConstant: cfg.levelIsConstant ?? false,
          dataLabels: {
            enabled: true,
            style: {
              textOutline: 'none',
              fontWeight: 'normal',
            },
          },
          levels: [
            {
              level: 1,
              dataLabels: {
                enabled: true,
                align: 'left',
                verticalAlign: 'top',
                style: {
                  fontSize: '14px',
                  fontWeight: 'bold',
                },
              },
              borderWidth: 3,
            },
          ],
          data: seriesData,
        } as Highcharts.SeriesTreemapOptions,
      ],
      tooltip: {
        pointFormat: '<b>{point.name}</b>: {point.value}',
      },
      credits: { enabled: false },
    };

    if (this.chart) {
      this.chart.update(options, true, true);
    } else {
      this.chart = Highcharts.chart(container, options);
    }
  }

  protected override render() {
    return html`<div class="treemap-container" ${ref(this.containerRef)}></div>`;
  }

  /**
   * Programmatic API
   */
  setData(data: TreemapNode[]): void {
    this.data = data;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'viz-treemap': VizTreemap;
  }
}
