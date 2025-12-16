import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { VizBaseComponent } from '../../base/viz-base-component.js';
import type { DashboardLayout } from '../../types/index.js';

/**
 * Dashboard grid layout container
 * Arranges viz-widget components in a responsive grid
 */
@customElement('viz-dashboard')
export class VizDashboard extends VizBaseComponent {
  @property({ type: Number })
  columns = 2;

  @property({ type: Number })
  gap = 16;

  @property({ type: String })
  layout: DashboardLayout = 'grid';

  static override styles = [
    ...VizBaseComponent.styles,
    css`
      :host {
        display: block;
        width: 100%;
      }

      .dashboard {
        display: grid;
        width: 100%;
      }

      .dashboard.layout-flex {
        display: flex;
        flex-wrap: wrap;
      }

      .dashboard.layout-masonry {
        display: block;
      }

      ::slotted(*) {
        box-sizing: border-box;
      }
    `,
  ];

  protected override render() {
    const styles = this.getLayoutStyles();

    return html`
      <div class="dashboard layout-${this.layout}" style=${styles}>
        <slot></slot>
      </div>
    `;
  }

  private getLayoutStyles(): string {
    const styles: string[] = [];

    if (this.layout === 'grid') {
      styles.push(`grid-template-columns: repeat(${this.columns}, 1fr)`);
      styles.push(`gap: ${this.gap}px`);
    } else if (this.layout === 'flex') {
      styles.push(`gap: ${this.gap}px`);
    } else if (this.layout === 'masonry') {
      styles.push(`column-count: ${this.columns}`);
      styles.push(`column-gap: ${this.gap}px`);
    }

    return styles.join('; ');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'viz-dashboard': VizDashboard;
  }
}
