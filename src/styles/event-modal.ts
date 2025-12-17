import { css } from 'lit';

/**
 * Styles for the market event modal component
 */
export const eventModalStyles = css`
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease-out;
  }

  .modal {
    background: var(--_bg, #ffffff);
    border-radius: var(--_radius, 16px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    max-width: 420px;
    width: 90%;
    max-height: 90vh;
    overflow: hidden;
    animation: slideUp 0.3s ease-out;
  }

  .modal-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  }

  .modal-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .modal-icon.crash { background: #ef4444; }
  .modal-icon.rally { background: #22c55e; }
  .modal-icon.policy { background: #f59e0b; }
  .modal-icon.crisis { background: #dc2626; }
  .modal-icon.milestone { background: #3b82f6; }

  .modal-title-group {
    flex: 1;
    min-width: 0;
  }

  .modal-title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--_text, #1d1d1f);
    line-height: 1.4;
  }

  .modal-type {
    display: inline-block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(128, 128, 128, 0.8);
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: rgba(128, 128, 128, 0.9);
    margin-bottom: 1rem;
  }

  .modal-date-icon {
    display: flex;
    opacity: 0.7;
  }

  .modal-description {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--_text, #1d1d1f);
  }

  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(128, 128, 128, 0.2);
    display: flex;
    justify-content: flex-end;
  }

  .modal-close-btn {
    padding: 0.5rem 1.25rem;
    border: none;
    border-radius: 8px;
    background: var(--_primary, #0071e3);
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.15s ease;
  }

  .modal-close-btn:hover {
    opacity: 0.9;
  }

  .modal-close-btn:active {
    opacity: 0.8;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;
