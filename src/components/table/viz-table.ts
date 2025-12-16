import { html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { VizBaseComponent } from '../../base/viz-base-component.js';
import type { TableColumn, TableConfig } from '../../types/index.js';

interface SortState {
  column: string | null;
  direction: 'asc' | 'desc';
}

/**
 * Interactive data table with sorting, filtering, and pagination
 */
@customElement('viz-table')
export class VizTable extends VizBaseComponent {
  @property({ type: Array })
  data: Record<string, unknown>[] = [];

  @property({ type: Array })
  columns: TableColumn[] = [];

  @property({ type: Object })
  config: TableConfig = {};

  @state()
  private filterText = '';

  @state()
  private sortState: SortState = { column: null, direction: 'asc' };

  @state()
  private currentPage = 1;

  @state()
  private selectedRows: Set<number> = new Set();

  // Computed values as getters
  private get filteredData(): Record<string, unknown>[] {
    const filter = this.filterText.toLowerCase();
    if (!filter) return this.data;

    return this.data.filter((row) =>
      this.columns.some((col) => {
        const value = row[col.key];
        return String(value).toLowerCase().includes(filter);
      })
    );
  }

  private get sortedData(): Record<string, unknown>[] {
    const data = [...this.filteredData];
    const { column, direction } = this.sortState;

    if (!column) return data;

    return data.sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  private get paginatedData(): Record<string, unknown>[] {
    const data = this.sortedData;
    const pageSize = this.config.pageSize ?? 10;
    const paginate = this.config.paginate ?? false;

    if (!paginate) return data;

    const start = (this.currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }

  private get totalPages(): number {
    const pageSize = this.config.pageSize ?? 10;
    return Math.ceil(this.filteredData.length / pageSize);
  }

  static override styles = [
    ...VizBaseComponent.styles,
    css`
      :host {
        display: block;
      }

      .table-wrapper {
        background: var(--_bg);
        border-radius: var(--_radius);
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .table-toolbar {
        padding: 1rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      }

      .filter-input {
        width: 100%;
        max-width: 300px;
        padding: 0.5rem 1rem;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        font-size: 0.875rem;
        background: var(--_bg);
        color: var(--_text);
      }

      .filter-input:focus {
        outline: none;
        border-color: var(--_primary);
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      }

      th {
        font-weight: 600;
        color: var(--_text);
        background: rgba(0, 0, 0, 0.02);
        user-select: none;
      }

      th.sortable {
        cursor: pointer;
      }

      th.sortable:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      th .sort-indicator {
        margin-left: 0.5rem;
        opacity: 0.5;
      }

      th.sorted .sort-indicator {
        opacity: 1;
        color: var(--_primary);
      }

      td {
        color: var(--_text);
      }

      tr.selectable {
        cursor: pointer;
      }

      tr.selectable:hover {
        background: rgba(0, 0, 0, 0.02);
      }

      tr.selected {
        background: rgba(0, 113, 227, 0.1);
      }

      .pagination {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
      }

      .pagination-info {
        font-size: 0.875rem;
        color: var(--_text);
        opacity: 0.7;
      }

      .pagination-controls {
        display: flex;
        gap: 0.5rem;
      }

      .pagination-btn {
        padding: 0.5rem 1rem;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 6px;
        background: var(--_bg);
        color: var(--_text);
        cursor: pointer;
        font-size: 0.875rem;
      }

      .pagination-btn:hover:not(:disabled) {
        background: rgba(0, 0, 0, 0.04);
      }

      .pagination-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .empty-state {
        padding: 3rem;
        text-align: center;
        color: var(--_text);
        opacity: 0.5;
      }
    `,
  ];

  protected override render() {
    return html`
      <div class="table-wrapper" part="wrapper">
        ${this.config.filterable ? this.renderToolbar() : nothing}

        <table part="table">
          <thead part="thead">
            <tr>
              ${this.columns.map((col) => this.renderHeaderCell(col))}
            </tr>
          </thead>
          <tbody part="tbody">
            ${this.paginatedData.length === 0
              ? this.renderEmptyState()
              : this.paginatedData.map((row, index) =>
                  this.renderRow(row, index)
                )}
          </tbody>
        </table>

        ${this.config.paginate ? this.renderPagination() : nothing}
      </div>
    `;
  }

  private renderToolbar() {
    return html`
      <div class="table-toolbar" part="toolbar">
        <input
          class="filter-input"
          part="filter-input"
          type="text"
          placeholder="Filter..."
          .value=${this.filterText}
          @input=${this.handleFilterInput}
        />
      </div>
    `;
  }

  private renderHeaderCell(col: TableColumn) {
    const isSortable = col.sortable && this.config.sortable;
    const isSorted = this.sortState.column === col.key;
    const indicator =
      isSorted && this.sortState.direction === 'desc' ? '▼' : '▲';

    return html`
      <th
        class=${isSortable ? (isSorted ? 'sortable sorted' : 'sortable') : ''}
        style=${col.width ? `width: ${col.width}` : ''}
        @click=${isSortable ? () => this.handleSort(col.key) : nothing}
      >
        ${col.header}
        ${isSortable
          ? html`<span class="sort-indicator">${indicator}</span>`
          : nothing}
      </th>
    `;
  }

  private renderRow(row: Record<string, unknown>, index: number) {
    const isSelectable = this.config.selectable;
    const isSelected = this.selectedRows.has(index);

    return html`
      <tr
        class=${isSelectable
          ? isSelected
            ? 'selectable selected'
            : 'selectable'
          : ''}
        @click=${isSelectable ? () => this.handleRowClick(index, row) : nothing}
      >
        ${this.columns.map((col) => {
          const value = row[col.key];
          const displayValue = col.formatter
            ? col.formatter(value)
            : String(value ?? '');
          return html`<td>${displayValue}</td>`;
        })}
      </tr>
    `;
  }

  private renderEmptyState() {
    return html`
      <tr>
        <td class="empty-state" colspan=${this.columns.length}>
          No data available
        </td>
      </tr>
    `;
  }

  private renderPagination() {
    const total = this.filteredData.length;
    const pageSize = this.config.pageSize ?? 10;
    const start = (this.currentPage - 1) * pageSize + 1;
    const end = Math.min(this.currentPage * pageSize, total);

    return html`
      <div class="pagination">
        <div class="pagination-info">${start}-${end} of ${total}</div>
        <div class="pagination-controls">
          <button
            class="pagination-btn"
            ?disabled=${this.currentPage === 1}
            @click=${this.handlePrevPage}
          >
            Previous
          </button>
          <button
            class="pagination-btn"
            ?disabled=${this.currentPage >= this.totalPages}
            @click=${this.handleNextPage}
          >
            Next
          </button>
        </div>
      </div>
    `;
  }

  private handleFilterInput(e: Event): void {
    this.filterText = (e.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.emitFilterChange();
  }

  private handleSort(column: string): void {
    if (this.sortState.column === column) {
      this.sortState = {
        column,
        direction: this.sortState.direction === 'asc' ? 'desc' : 'asc',
      };
    } else {
      this.sortState = { column, direction: 'asc' };
    }

    this.dispatchEvent(
      new CustomEvent('sort-change', {
        detail: this.sortState,
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleRowClick(index: number, row: Record<string, unknown>): void {
    const selected = new Set(this.selectedRows);

    if (this.config.multiSelect) {
      if (selected.has(index)) {
        selected.delete(index);
      } else {
        selected.add(index);
      }
    } else {
      selected.clear();
      selected.add(index);
    }

    this.selectedRows = selected;

    this.dispatchEvent(
      new CustomEvent('row-select', {
        detail: { index, row, selected: Array.from(selected) },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handlePrevPage(): void {
    this.currentPage = Math.max(1, this.currentPage - 1);
    this.emitPageChange();
  }

  private handleNextPage(): void {
    this.currentPage = Math.min(this.totalPages, this.currentPage + 1);
    this.emitPageChange();
  }

  private emitFilterChange(): void {
    this.dispatchEvent(
      new CustomEvent('filter-change', {
        detail: { filter: this.filterText },
        bubbles: true,
        composed: true,
      })
    );
  }

  private emitPageChange(): void {
    this.dispatchEvent(
      new CustomEvent('page-change', {
        detail: { page: this.currentPage },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Programmatic API
   */
  setData(data: Record<string, unknown>[]): void {
    this.data = data;
  }

  getSelectedRows(): Record<string, unknown>[] {
    return Array.from(this.selectedRows).map((i) => this.data[i]!);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'viz-table': VizTable;
  }
}
