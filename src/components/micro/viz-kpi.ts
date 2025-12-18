/**
 * VizKPI - Key Performance Indicator card component
 * Displays a metric with optional trend, change indicator, and sparkline
 */

import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { VizBaseComponent } from '../../base/viz-base-component.js';
import { microSharedStyles, trendIcons } from '../../styles/micro-shared.js';
import {
  formatNumber,
  formatPercentChange,
  calculatePercentChange,
  type NumberFormat,
} from '../../utils/number-format.js';
import './viz-sparkline.js';

export type ComponentSize = 'small' | 'medium' | 'large';

export interface KPIThresholds {
  warning?: number;
  critical?: number;
}

/**
 * KPI card component for displaying metrics
 *
 * @example
 * ```html
 * <viz-kpi
 *   value="1234.56"
 *   label="Revenue"
 *   prefix="$"
 *   format="compact"
 *   previous-value="1100"
 *   trend="[100,120,115,130,125,140]"
 * ></viz-kpi>
 * ```
 */
@customElement('viz-kpi')
export class VizKPI extends VizBaseComponent {
  /** Current value to display */
  @property({ type: Number })
  value = 0;

  /** Label/title for the KPI */
  @property({ type: String })
  label = '';

  /** Unit suffix (e.g., "%", "ms") */
  @property({ type: String })
  unit = '';

  /** Value prefix (e.g., "$", "€") */
  @property({ type: String, attribute: 'prefix' })
  valuePrefix = '';

  /** Previous value for calculating change */
  @property({ type: Number, attribute: 'previous-value' })
  previousValue: number | null = null;

  /** Trend data for sparkline */
  @property({ type: Array })
  trend: number[] = [];

  /** Number format type */
  @property({ type: String })
  format: NumberFormat = 'number';

  /** Decimal places to show */
  @property({ type: Number })
  decimals = 0;

  /** Component size variant */
  @property({ type: String, reflect: true })
  size: ComponentSize = 'medium';

  /** Value thresholds for color coding */
  @property({ type: Object })
  thresholds: KPIThresholds | null = null;

  /** Override trend color */
  @property({ type: String, attribute: 'trend-color' })
  trendColor = '';

  /** Invert trend colors (lower is better) */
  @property({ type: Boolean, attribute: 'invert-trend' })
  invertTrend = false;

  static override styles = [
    ...VizBaseComponent.styles,
    microSharedStyles,
    css`
      :host {
        display: block;
      }

      .kpi-container {
        background: var(--_bg);
        border-radius: var(--_radius);
        padding: var(--_micro-padding);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        transition: box-shadow 0.2s ease;
        cursor: default;
      }

      .kpi-container:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      }

      .kpi-label {
        font-size: var(--_micro-font-size);
        color: var(--_text);
        opacity: 0.7;
        margin-bottom: var(--_micro-gap);
        font-weight: 500;
      }

      .kpi-value-row {
        display: flex;
        align-items: baseline;
        gap: var(--_micro-gap);
        flex-wrap: wrap;
      }

      .kpi-value {
        font-size: var(--_micro-value-font-size);
        font-weight: 700;
        color: var(--_text);
        line-height: 1.2;
      }

      .kpi-value.warning {
        color: #f59e0b;
      }

      .kpi-value.critical {
        color: #ef4444;
      }

      .kpi-change {
        display: inline-flex;
        align-items: center;
        gap: 0.125rem;
        font-size: calc(var(--_micro-font-size) * 0.9);
        font-weight: 500;
        padding: 0.125rem 0.375rem;
        border-radius: 4px;
      }

      .kpi-change.up {
        color: #22c55e;
        background: rgba(34, 197, 94, 0.1);
      }

      .kpi-change.down {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
      }

      .kpi-change.neutral {
        color: #6b7280;
        background: rgba(107, 114, 128, 0.1);
      }

      .kpi-change.inverted.up {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
      }

      .kpi-change.inverted.down {
        color: #22c55e;
        background: rgba(34, 197, 94, 0.1);
      }

      .kpi-change svg {
        width: 14px;
        height: 14px;
      }

      .kpi-sparkline {
        margin-top: var(--_micro-gap);
      }

      /* Size-specific sparkline heights */
      :host([size='small']) .kpi-sparkline {
        height: 24px;
      }

      :host([size='medium']) .kpi-sparkline,
      :host(:not([size])) .kpi-sparkline {
        height: 32px;
      }

      :host([size='large']) .kpi-sparkline {
        height: 48px;
      }
    `,
  ];

  private getFormattedValue(): string {
    return formatNumber(this.value, {
      format: this.format,
      decimals: this.decimals,
      prefix: this.valuePrefix,
      unit: this.unit,
    });
  }

  private getChange(): { value: number; percent: number; direction: 'up' | 'down' | 'neutral' } {
    if (this.previousValue === null) {
      return { value: 0, percent: 0, direction: 'neutral' };
    }

    const change = this.value - this.previousValue;
    const percent = calculatePercentChange(this.value, this.previousValue);
    const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

    return { value: change, percent, direction };
  }

  private getValueClass(): string {
    if (!this.thresholds) return '';

    if (this.thresholds.critical !== undefined && this.value >= this.thresholds.critical) {
      return 'critical';
    }
    if (this.thresholds.warning !== undefined && this.value >= this.thresholds.warning) {
      return 'warning';
    }
    return '';
  }

  private getSparklineHeight(): number {
    switch (this.size) {
      case 'small':
        return 24;
      case 'large':
        return 48;
      default:
        return 32;
    }
  }

  private getTrendColor(): string {
    if (this.trendColor) return this.trendColor;

    const { direction } = this.getChange();
    if (direction === 'neutral') return '#6b7280';

    if (this.invertTrend) {
      return direction === 'up' ? '#ef4444' : '#22c55e';
    }
    return direction === 'up' ? '#22c55e' : '#ef4444';
  }

  private handleClick(): void {
    this.dispatchEvent(
      new CustomEvent('viz-kpi-click', {
        detail: {
          value: this.value,
          previousValue: this.previousValue,
          label: this.label,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    const change = this.getChange();
    const valueClass = this.getValueClass();
    const showChange = this.previousValue !== null && change.direction !== 'neutral';

    return html`
      <div class="kpi-container" part="container" @click=${this.handleClick}>
        ${this.label
          ? html`<div class="kpi-label" part="label">${this.label}</div>`
          : nothing}

        <div class="kpi-value-row">
          <span class="kpi-value ${valueClass}" part="value">
            ${this.getFormattedValue()}
          </span>

          ${showChange
            ? html`
                <span
                  class="kpi-change ${change.direction} ${this.invertTrend ? 'inverted' : ''}"
                  part="change"
                >
                  <span .innerHTML=${change.direction === 'up' ? trendIcons.up : trendIcons.down}></span>
                  ${formatPercentChange(Math.abs(change.percent), 1)}
                </span>
              `
            : nothing}
        </div>

        ${this.trend.length > 0
          ? html`
              <div class="kpi-sparkline" part="sparkline">
                <viz-sparkline
                  .data=${this.trend}
                  type="area"
                  .color=${this.getTrendColor()}
                  .height=${this.getSparklineHeight()}
                  show-last
                ></viz-sparkline>
              </div>
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'viz-kpi': VizKPI;
  }
}
