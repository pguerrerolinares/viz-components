# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Framework-agnostic Web Components library for data visualization, built with **Lit** and **Highcharts**. Designed for maximum portability across Next.js, Angular, JSP, and vanilla HTML.

## Development Commands

**Package Manager**: Bun (required)

```bash
bun install          # Install dependencies
bun run build        # Build for production (minified + sourcemaps)
bun run dev          # Build in watch mode
bun run build:types  # Generate TypeScript declarations
bun run typecheck    # TypeScript type checking
```

## Architecture

### Tech Stack
- **Lit** 3.x - Web Components framework with decorators
- **Highcharts** 12.x - Charting library (external dependency)
- **Bun** - Bundler and runtime (ultra-fast, zero-config)
- **TypeScript** - Strict mode, ES2020 target

### Key Patterns

**Base Component**: All components extend `VizBaseComponent` which provides:
- Theme color extraction from CSS custom properties (`--viz-*`)
- Loading/error state management
- Common base styles

```typescript
export class VizMyComponent extends VizBaseComponent {
  @property({ type: String }) data = '';
  @state() protected internalState = null;

  override render() {
    return html`<div class="container">...</div>`;
  }
}
customElements.define('viz-my-component', VizMyComponent);
```

**Theming**: Components consume CSS custom properties from host applications:
- `--viz-primary`, `--viz-bg`, `--viz-text` - Core colors
- `--viz-accent-*` - Accent colors
- `--viz-radius` - Border radius

### Build Output
- `dist/index.js` - ES module bundle
- `dist/index.d.ts` - TypeScript declarations

Highcharts and Lit are external dependencies (peer deps), not bundled.

## Planned Components

Components to implement (currently only `VizBaseComponent` exists):
- `<viz-chart>` - Universal chart (line/bar/pie/area)
- `<viz-dashboard>` - Grid layout container
- `<viz-widget>` - Widget wrapper with header/slots
- `<viz-table>` - Interactive data table
- `<viz-heatmap>` - Heatmap visualization
- `<viz-treemap>` - Treemap visualization
