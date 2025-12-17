import { html, nothing, LitElement, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { eventModalStyles } from '../../styles/event-modal.js';
import { LUCIDE_ICONS, CALENDAR_ICON } from '../../utils/market-event-icons.js';
import { EVENT_TYPE_LABELS } from '../../utils/market-event-constants.js';
import type { MarketEvent } from '../../types/index.js';

/**
 * Modal component for displaying market event details
 *
 * @fires close - Fired when the modal is closed
 *
 * @example
 * ```html
 * <viz-event-modal
 *   .event=${selectedEvent}
 *   @close=${() => this.selectedEvent = null}
 * ></viz-event-modal>
 * ```
 */
@customElement('viz-event-modal')
export class VizEventModal extends LitElement {
  /** The market event to display. If null, modal is hidden. */
  @property({ type: Object })
  event: MarketEvent | null = null;

  static override styles = [
    css`
      :host {
        --_bg: var(--viz-bg, #ffffff);
        --_text: var(--viz-text, #1d1d1f);
        --_primary: var(--viz-primary, #0071e3);
        --_radius: var(--viz-radius, 16px);
      }
    `,
    eventModalStyles,
  ];

  private handleOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      this.dispatchEvent(new CustomEvent('close'));
    }
  }

  private handleClose(): void {
    this.dispatchEvent(new CustomEvent('close'));
  }

  private formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  protected override render() {
    if (!this.event) return nothing;

    const { type, title, date, description } = this.event;

    return html`
      <div class="modal-overlay" part="overlay" @click=${this.handleOverlayClick}>
        <div class="modal" part="modal">
          <div class="modal-header">
            <div class="modal-icon ${type}">${unsafeHTML(LUCIDE_ICONS[type])}</div>
            <div class="modal-title-group">
              <h3 class="modal-title">${title}</h3>
              <span class="modal-type">${EVENT_TYPE_LABELS[type]}</span>
            </div>
          </div>
          <div class="modal-body">
            <div class="modal-date">
              <span class="modal-date-icon">${unsafeHTML(CALENDAR_ICON)}</span>
              ${this.formatDate(date)}
            </div>
            <p class="modal-description">${description}</p>
          </div>
          <div class="modal-footer">
            <button class="modal-close-btn" @click=${this.handleClose}>Close</button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'viz-event-modal': VizEventModal;
  }
}
