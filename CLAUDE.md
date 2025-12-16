# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Framework-agnostic Web Components library for data visualization. Uses **Lit** for component development and **Highcharts** for charts. Designed for maximum portability across Next.js, Angular, JSP, and vanilla HTML.

## Development Commands

**Package Manager**: Bun (required)

```bash
bun install          # Install dependencies
bun run build        # Build for production (minified + sourcemaps)
bun run dev          # Build in watch mode
bun run build:types  # Generate TypeScript declarations
bun run typecheck    # TypeScript type checking
bun run serve        # Run local dev server for examples
```

## Project Structure

```
src/
├── index.ts                      # Main exports
├── base/
│   └── viz-base-component.ts     # Abstract base class (extends LitElement)
├── components/
│   ├── chart/
│   │   ├── viz-chart.ts          # Line/bar/pie/area charts
│   │   ├── viz-stock-chart.ts    # Real-time candlestick chart
│   │   └── viz-stock-evolution.ts # Historical stock evolution with events
│   ├── dashboard/
│   │   ├── viz-dashboard.ts      # Grid layout container
│   │   └── viz-widget.ts         # Widget wrapper
│   ├── table/
│   │   └── viz-table.ts          # Data table with sort/filter
│   └── advanced/
│       ├── viz-heatmap.ts        # Heatmap visualization
│       └── viz-treemap.ts        # Treemap visualization
├── styles/
│   ├── highcharts-theme.ts       # Shared Highcharts theme CSS variables
│   └── chart-header.ts           # Shared chart header styles
├── utils/
│   └── sample-data.ts            # Sample data generators for demos
└── types/
    └── index.ts                  # TypeScript definitions
```

## Architecture

### Tech Stack
- **Lit** 3.x - Web Components framework with decorators and templates
- **Highcharts** 12.x - Charting library (peer dependency)
- **Bun** - Bundler and runtime
- **TypeScript** - Strict mode, ES2020 target

### Key Patterns

**Base Component**: All components extend `VizBaseComponent` (which extends LitElement):

```typescript
import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { VizBaseComponent } from '../base/viz-base-component.js';

@customElement('viz-my-component')
class VizMyComponent extends VizBaseComponent {
  @property({ type: Array })
  data: unknown[] = [];

  @state()
  private internalState = '';

  static override styles = [
    VizBaseComponent.styles,
    css`
      :host { display: block; }
    `
  ];

  protected override render() {
    return html`<div>${this.data.length} items</div>`;
  }
}
```

**Theming**: Components consume CSS custom properties from host applications:
- `--viz-primary`, `--viz-bg`, `--viz-text` - Core colors
- `--viz-accent-purple`, `--viz-accent-cyan`, `--viz-accent-pink` - Accent colors
- `--viz-radius` - Border radius

## Components

| Component | Tag | Description |
|-----------|-----|-------------|
| VizChart | `<viz-chart>` | Line, bar, column, pie, area charts |
| VizStockChart | `<viz-stock-chart>` | Real-time candlestick chart with OHLC data |
| VizStockEvolution | `<viz-stock-evolution>` | Historical stock evolution with market events |
| VizDashboard | `<viz-dashboard>` | Grid/masonry/flex layout container |
| VizWidget | `<viz-widget>` | Widget wrapper with header and slots |
| VizTable | `<viz-table>` | Sortable, filterable, paginated table |
| VizHeatmap | `<viz-heatmap>` | Heatmap visualization |
| VizTreemap | `<viz-treemap>` | Treemap visualization |

## Code Conventions

- No `any` types - use `unknown` or proper types
- All components extend `VizBaseComponent`
- Use `@property()` for public reactive attributes
- Use `@state()` for private reactive state
- Always provide CSS custom property fallbacks
- Use `@customElement()` decorator for registration
- Shadow DOM for style encapsulation
- Use `override` keyword for inherited methods

## Highcharts Stock Charts - Dark Mode & Adaptive Theme

### The Problem

Implementing dark/light theme switching for Highcharts Stock charts (`viz-stock-chart`, `viz-stock-evolution`) with Shadow DOM is complex due to several conflicting issues:

1. **CSS Specificity Conflict**: Highcharts adaptive theme uses `@media (prefers-color-scheme: dark)` on `:root` which has the same specificity as `.highcharts-dark` class, causing system preferences to override manual theme selection.

2. **Shadow DOM Isolation**: CSS selectors in the adaptive theme can't penetrate Shadow DOM, but CSS custom properties CAN inherit through.

3. **Range Selector State Reset**: Updating chart options with `rangeSelector.selected` resets the user's button selection.

4. **SVG Attribute vs CSS Property**: Highcharts sets SVG `fill` attributes directly via JavaScript, which CSS `!important` cannot override.

### The Solution

#### 1. Import Adaptive Theme + Define CSS Custom Properties on Container

```typescript
import 'highcharts/themes/adaptive';
```

Define Highcharts CSS custom properties on the **container element** (not `:root`) to override system preferences:

```css
.stock-chart-container.highcharts-light {
  --highcharts-background-color: #ffffff;
  --highcharts-neutral-color-100: #000000;
  /* ... all light theme colors */
}

.stock-chart-container.highcharts-dark {
  --highcharts-background-color: #1c1c1e;
  --highcharts-neutral-color-100: #ffffff;
  /* ... all dark theme colors */
}
```

#### 2. Apply Theme Class to Container (Not Document Root)

```typescript
protected override updateTheme(): void {
  const container = this.containerRef.value;
  if (!container) return;

  const isDark = this.isDarkMode();
  container.classList.toggle('highcharts-dark', isDark);
  container.classList.toggle('highcharts-light', !isDark);

  // Update chart...
}
```

#### 3. Preserve Range Selector State

**Critical**: Only configure `rangeSelector` on initial chart creation, not on updates:

```typescript
const options: Highcharts.Options = {
  // Only set rangeSelector on creation, not updates
  ...(this.chart
    ? {}
    : {
        rangeSelector: {
          selected: 4,
          buttons: [...],
          buttonTheme: {...},
        },
      }),
  // Other options that can safely update...
};
```

#### 4. Preserve Zoom/Extremes on Updates

```typescript
if (this.chart) {
  // Save current state
  const xAxis = this.chart.xAxis[0];
  const extremes = xAxis?.getExtremes();

  this.chart.update(options, true, true);

  // Restore state
  if (xAxis && extremes && extremes.userMin !== undefined) {
    xAxis.setExtremes(extremes.userMin, extremes.userMax, true, false);
  }
}
```

#### 5. Update Button Colors on Theme Change

In `updateTheme()`, only update the button theme colors (not the entire rangeSelector):

```typescript
this.chart.update({
  rangeSelector: {
    buttonTheme: {
      states: {
        hover: { fill: primaryColor, style: { color: '#ffffff' } },
        select: { fill: primaryColor, style: { color: '#ffffff', fontWeight: 'bold' } },
      },
    },
  },
}, true, true, false);
```

### Key Takeaways

| Issue | Wrong Approach | Correct Approach |
|-------|----------------|------------------|
| Theme class location | `document.documentElement` | Chart container element |
| CSS custom properties | Rely on `:root` inheritance | Define on container to override |
| rangeSelector config | Include in every update | Only on initial creation |
| Zoom state | Let Highcharts reset | Save/restore extremes manually |
| Button colors | Part of rangeSelector | Update separately in updateTheme() |

### Files Implementing This Pattern

- `src/components/chart/viz-stock-chart.ts`
- `src/components/chart/viz-stock-evolution.ts`
