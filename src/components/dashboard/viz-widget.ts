import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { VizBaseComponent } from '../../base/viz-base-component.js';

/**
 * Widget wrapper with header, content slot, and optional footer
 * Used inside viz-dashboard for consistent styling
 */
@customElement('viz-widget')
export class VizWidget extends VizBaseComponent {
  @property({ type: String })
  override title = '';

  @property({ type: String })
  subtitle = '';

  @property({ type: Number })
  span = 1;

  @property({ type: String })
  height: string | number = 'auto';

  static override styles = [
    ...VizBaseComponent.styles,
    css`
      :host {
        display: block;
      }

      .widget {
        background: var(--_bg);
        border-radius: var(--_radius);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .widget-header {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      }

      .widget-title {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--_text);
      }

      .widget-subtitle {
        margin: 0.25rem 0 0;
        font-size: 0.875rem;
        color: var(--_text);
        opacity: 0.7;
      }

      .widget-content {
        flex: 1;
        padding: 1rem 1.25rem;
        position: relative;
      }

      .widget-footer {
        padding: 0.75rem 1.25rem;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
      }

      .widget-footer:empty {
        display: none;
      }

      .loading-overlay {
        position: absolute;
        inset: 0;
        background: var(--_bg);
        opacity: 0.8;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .spinner {
        width: 24px;
        height: 24px;
        border: 2px solid var(--_primary);
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ];

  protected override render() {
    const widgetStyles = [
      this.span > 1 ? `grid-column: span ${this.span}` : '',
      this.height !== 'auto' ? `height: ${this.height}px` : '',
    ]
      .filter(Boolean)
      .join('; ');

    return html`
      <div class="widget" part="widget" style=${widgetStyles}>
        ${this.title || this.subtitle
          ? html`
              <div class="widget-header" part="header">
                <slot name="header">
                  ${this.title
                    ? html`<h3 class="widget-title" part="title">${this.title}</h3>`
                    : ''}
                  ${this.subtitle
                    ? html`<p class="widget-subtitle" part="subtitle">${this.subtitle}</p>`
                    : ''}
                </slot>
              </div>
            `
          : ''}

        <div class="widget-content" part="content">
          <slot></slot>
          ${this.loading
            ? html`
                <div class="loading-overlay" part="loading">
                  <div class="spinner" part="spinner"></div>
                </div>
              `
            : ''}
        </div>

        <div class="widget-footer" part="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'viz-widget': VizWidget;
  }
}
