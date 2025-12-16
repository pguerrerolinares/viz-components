import { css } from 'lit';

/**
 * Shared chart header styles for stock chart components
 * Provides consistent header layout, symbol info, and price/change display
 */
export const chartHeaderStyles = css`
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: var(--_bg);
    border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  }

  .symbol-info {
    display: flex;
    align-items: baseline;
    gap: 1rem;
  }

  .symbol {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--_text);
  }

  .price {
    font-size: 1.25rem;
    font-weight: 600;
  }

  .price.up {
    color: #22c55e;
  }

  .price.down {
    color: #ef4444;
  }

  .change {
    font-size: 0.875rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .change.up {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }

  .change.down {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
`;
