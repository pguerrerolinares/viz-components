/**
 * VizStatus - Status indicator component
 * Displays status with icon, color, and optional label/value
 */

import { html, css, nothing, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { VizBaseComponent } from '../../base/viz-base-component.js';
import { microSharedStyles, statusColors, statusIcons } from '../../styles/micro-shared.js';

// CSS color constants
const CSS_SUCCESS = unsafeCSS(statusColors.success);
const CSS_WARNING = unsafeCSS(statusColors.warning);
const CSS_ERROR = unsafeCSS(statusColors.error);
const CSS_INFO = unsafeCSS(statusColors.info);
const CSS_NEUTRAL = unsafeCSS(statusColors.neutral);

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type ComponentSize = 'small' | 'medium' | 'large';

/**
 * Status indicator component
 *
 * @example
 * ```html
 * <viz-status status="success" label="API" value="Operational"></viz-status>
 * <viz-status status="warning" label="Database" value="High Load" pulse></viz-status>
 * <viz-status status="error" label="Cache" value="Down"></viz-status>
 * ```
 */
@customElement('viz-status')
export class VizStatus extends VizBaseComponent {
  /** Status type (determines color and default icon) */
  @property({ type: String, reflect: true })
  status: StatusType = 'neutral';

  /** Label text */
  @property({ type: String })
  label = '';

  /** Value text */
  @property({ type: String })
  value = '';

  /** Component size */
  @property({ type: String, reflect: true })
  size: ComponentSize = 'medium';

  /** Enable pulse animation */
  @property({ type: Boolean })
  pulse = false;

  /** Show icon (default: true) */
  @property({ type: Boolean, attribute: 'show-icon' })
  showIcon = true;

  /** Custom icon SVG string (overrides default) */
  @property({ type: String })
  icon = '';

  static override styles = [
    ...VizBaseComponent.styles,
    microSharedStyles,
    css`
      :host {
        display: inline-flex;
      }

      .status-container {
        display: inline-flex;
        align-items: center;
        gap: var(--_micro-gap);
        padding: calc(var(--_micro-padding) * 0.5) var(--_micro-padding);
        background: var(--_bg);
        border-radius: calc(var(--_radius) * 0.5);
        cursor: default;
        transition: background-color 0.2s ease;
      }

      .status-container:hover {
        filter: brightness(0.98);
      }

      .status-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--_micro-icon-size);
        height: var(--_micro-icon-size);
        min-width: var(--_micro-icon-size);
        min-height: var(--_micro-icon-size);
        max-width: var(--_micro-icon-size);
        max-height: var(--_micro-icon-size);
        border-radius: 50%;
        flex-shrink: 0;
        flex-grow: 0;
        box-sizing: border-box;
        overflow: hidden;
      }

      .status-indicator.is-success {
        background: ${CSS_SUCCESS};
      }

      .status-indicator.is-warning {
        background: ${CSS_WARNING};
      }

      .status-indicator.is-error {
        background: ${CSS_ERROR};
      }

      .status-indicator.is-info {
        background: ${CSS_INFO};
      }

      .status-indicator.is-neutral {
        background: ${CSS_NEUTRAL};
      }

      .status-indicator.pulse {
        animation: statusPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }

      @keyframes statusPulse {
        0%,
        100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.7;
          transform: scale(0.95);
        }
      }

      .status-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        line-height: 0;
      }

      .status-icon svg {
        display: block;
        width: 10px;
        height: 10px;
      }

      .status-content {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
      }

      .status-label {
        font-size: var(--_micro-font-size);
        font-weight: 500;
        color: var(--_text);
        line-height: 1.2;
      }

      .status-value {
        font-size: calc(var(--_micro-font-size) * 0.9);
        color: var(--_text);
        opacity: 0.7;
        line-height: 1.2;
      }

      /* Inline layout when no value */
      .status-content.inline {
        flex-direction: row;
        align-items: center;
        gap: var(--_micro-gap);
      }

      /* Color-coded text based on status */
      :host([status='success']) .status-label {
        color: ${CSS_SUCCESS};
      }

      :host([status='warning']) .status-label {
        color: ${CSS_WARNING};
      }

      :host([status='error']) .status-label {
        color: ${CSS_ERROR};
      }

      :host([status='info']) .status-label {
        color: ${CSS_INFO};
      }
    `,
  ];

  private getIcon(): string {
    if (this.icon) return this.icon;
    return statusIcons[this.status] || statusIcons.neutral;
  }

  private handleClick(): void {
    this.dispatchEvent(
      new CustomEvent('viz-status-click', {
        detail: {
          status: this.status,
          label: this.label,
          value: this.value,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    const hasValue = Boolean(this.value);
    const hasLabel = Boolean(this.label);

    return html`
      <div class="status-container" part="container" @click=${this.handleClick}>
        ${this.showIcon
          ? html`
              <div
                class="status-indicator is-${this.status} ${this.pulse ? 'pulse' : ''}"
                part="indicator"
              >
                <span class="status-icon" part="icon">
                  ${unsafeHTML(this.getIcon())}
                </span>
              </div>
            `
          : nothing}

        ${hasLabel || hasValue
          ? html`
              <div class="status-content ${!hasValue ? 'inline' : ''}" part="content">
                ${hasLabel
                  ? html`<span class="status-label" part="label">${this.label}</span>`
                  : nothing}
                ${hasValue
                  ? html`<span class="status-value" part="value">${this.value}</span>`
                  : nothing}
              </div>
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'viz-status': VizStatus;
  }
}
