/**
 * Theme detection and management for viz-components
 * Framework-agnostic, works with any component type
 */

import type { ReactiveController, ReactiveControllerHost } from 'lit';

// ============================================================================
// Types
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeState {
  /** Current effective theme (resolved from auto) */
  current: 'light' | 'dark';
  /** Configured theme mode */
  mode: ThemeMode;
  /** Whether using system preference */
  isAuto: boolean;
}

export interface ThemeControllerOptions {
  /** Initial theme mode (default: 'auto') */
  initialMode?: ThemeMode;
  /** Callback when theme changes */
  onThemeChange?: (state: ThemeState) => void;
  /** CSS classes to check for dark mode on document (default: ['dark']) */
  darkModeSelectors?: string[];
}

export interface CoreThemeColors {
  primary: string;
  background: string;
  text: string;
  accent: string[];
}

// ============================================================================
// Theme Controller
// ============================================================================

/**
 * Reactive controller for theme detection and management
 * Works with any Lit component, no Highcharts dependency
 */
export class ThemeController implements ReactiveController {
  private host: ReactiveControllerHost;
  private options: ThemeControllerOptions;
  private observer: MutationObserver | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  private _mode: ThemeMode;
  private _currentTheme: 'light' | 'dark' = 'light';

  constructor(
    host: ReactiveControllerHost,
    options: ThemeControllerOptions = {}
  ) {
    this.host = host;
    this.options = options;
    this._mode = options.initialMode ?? 'auto';
    host.addController(this);
  }

  /** Get current theme state */
  get state(): ThemeState {
    return {
      current: this._currentTheme,
      mode: this._mode,
      isAuto: this._mode === 'auto',
    };
  }

  /** Check if dark mode is active */
  get isDark(): boolean {
    return this._currentTheme === 'dark';
  }

  /** Get current effective theme */
  get current(): 'light' | 'dark' {
    return this._currentTheme;
  }

  /** Get configured mode */
  get mode(): ThemeMode {
    return this._mode;
  }

  /** Set theme mode */
  setMode(mode: ThemeMode): void {
    const wasAuto = this._mode === 'auto';
    this._mode = mode;

    if (mode === 'auto' && !wasAuto) {
      this.setupAutoDetection();
    } else if (mode !== 'auto' && wasAuto) {
      this.cleanupAutoDetection();
    }

    this.detectTheme();
  }

  hostConnected(): void {
    this.detectTheme();

    if (this._mode === 'auto') {
      this.setupAutoDetection();
    }
  }

  hostDisconnected(): void {
    this.cleanup();
  }

  private setupAutoDetection(): void {
    // Watch for class changes on document
    this.observer = new MutationObserver(() => {
      this.debouncedDetect();
    });

    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    this.observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  private cleanupAutoDetection(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private debouncedDetect(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => this.detectTheme(), 50);
  }

  private detectTheme(): void {
    const previousTheme = this._currentTheme;

    if (this._mode === 'auto') {
      this._currentTheme = this.detectFromEnvironment();
    } else {
      this._currentTheme = this._mode;
    }

    if (previousTheme !== this._currentTheme) {
      this.options.onThemeChange?.(this.state);
      // Defer requestUpdate to avoid scheduling during update cycle
      queueMicrotask(() => this.host.requestUpdate());
    }
  }

  private detectFromEnvironment(): 'light' | 'dark' {
    const selectors = this.options.darkModeSelectors ?? ['dark'];

    // Check document classes - this is the primary detection method
    // We intentionally do NOT fall back to system preference because
    // the page toggle controls the class, not the system preference
    for (const selector of selectors) {
      if (
        document.documentElement.classList.contains(selector) ||
        document.body.classList.contains(selector)
      ) {
        return 'dark';
      }
    }

    // No dark class found = light mode
    return 'light';
  }

  private cleanup(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.cleanupAutoDetection();
  }
}

// ============================================================================
// Theme Utilities
// ============================================================================

/**
 * Get CSS custom property value with fallback
 */
export function getCSSProperty(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

/**
 * Read core theme colors from CSS custom properties
 */
export function readThemeColors(): CoreThemeColors {
  return {
    primary: getCSSProperty('--viz-primary', '#0071e3'),
    background: getCSSProperty('--viz-bg', '#ffffff'),
    text: getCSSProperty('--viz-text', '#1d1d1f'),
    accent: [
      getCSSProperty('--viz-accent-purple', '#6366f1'),
      getCSSProperty('--viz-accent-cyan', '#0d9488'),
      getCSSProperty('--viz-accent-pink', '#ec4899'),
    ],
  };
}

/**
 * Read extended theme palette including category colors
 */
export function readThemePalette(): string[] {
  return [
    getCSSProperty('--viz-primary', '#0071e3'),
    getCSSProperty('--viz-accent-purple', '#6366f1'),
    getCSSProperty('--viz-accent-cyan', '#0d9488'),
    getCSSProperty('--viz-accent-pink', '#ec4899'),
    getCSSProperty('--viz-category-web', '#3b82f6'),
    getCSSProperty('--viz-category-ai', '#8b5cf6'),
  ];
}
