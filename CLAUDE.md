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
│   │   └── viz-chart.ts          # Line/bar/pie/area charts
│   ├── dashboard/
│   │   ├── viz-dashboard.ts      # Grid layout container
│   │   └── viz-widget.ts         # Widget wrapper
│   ├── table/
│   │   └── viz-table.ts          # Data table with sort/filter
│   └── advanced/
│       ├── viz-heatmap.ts        # Heatmap visualization
│       └── viz-treemap.ts        # Treemap visualization
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
