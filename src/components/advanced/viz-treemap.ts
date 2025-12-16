import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import Highcharts from 'highcharts/highstock';
import HighchartsTreemap from 'highcharts/modules/treemap';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import { VizBaseComponent } from '../../base/viz-base-component.js';
import { updateHighchartsThemeDOM } from '../../utils/highcharts-theme.js';
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

  // theme property inherited from VizBaseComponent

  private chart: Highcharts.Chart | null = null;
  private containerRef = createRef<HTMLDivElement>();
  // themeObserver inherited from VizBaseComponent

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

  override connectedCallback(): void {
    super.connectedCallback();
    this.setupThemeObserver();
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
    // Only update chart when needed
    const needsChartUpdate =
      !this.chart ||
      changedProperties.has('data') ||
      changedProperties.has('config') ||
      changedProperties.has('chartTitle') ||
      changedProperties.has('theme');

    if (needsChartUpdate) {
      this.updateChart();
    }
  }

  // setupThemeObserver() inherited from VizBaseComponent with debouncing

  protected override updateTheme(): void {
    if (!this.chart) return;

    const theme = this.getThemeColors();
    const isDark = theme.background !== '#ffffff';

    // Update only chart background via Highcharts API
    this.chart.update(
      {
        chart: {
          backgroundColor: theme.background,
        },
        tooltip: {
          backgroundColor: theme.background,
          style: { color: theme.text },
        },
      },
      false,
      false,
      false
    );

    this.chart.redraw(false);

    // Update other colors via DOM manipulation to preserve layout
    const container = this.containerRef.value;
    if (!container) return;

    updateHighchartsThemeDOM(container, theme, isDark);
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
    return html`<div class="treemap-container" part="chart" ${ref(this.containerRef)}></div>`;
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
