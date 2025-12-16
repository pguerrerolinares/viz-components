import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import Highcharts from 'highcharts/highstock';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import { VizBaseComponent } from '../../base/viz-base-component.js';
import { updateHighchartsThemeDOM } from '../../utils/highcharts-theme.js';
import type { ChartType, ChartSeries, ChartConfig } from '../../types/index.js';

// Initialize accessibility module
if (typeof HighchartsAccessibility === 'function') {
  (HighchartsAccessibility as unknown as (hc: typeof Highcharts) => void)(Highcharts);
}

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

  // theme property inherited from VizBaseComponent

  private chart: Highcharts.Chart | null = null;
  private containerRef = createRef<HTMLDivElement>();
  // themeObserver inherited from VizBaseComponent

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
      changedProperties.has('type') ||
      changedProperties.has('data') ||
      changedProperties.has('config') ||
      changedProperties.has('categories') ||
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

    // Update only chart background and tooltip via Highcharts API
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
      // Merge user's custom Highcharts options
      ...this.config.highcharts,
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
    return html`<div class="chart-container" part="chart" ${ref(this.containerRef)}></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'viz-chart': VizChart;
  }
}
