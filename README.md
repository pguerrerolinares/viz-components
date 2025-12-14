# @pguerrero/viz-components

Framework-agnostic Web Components library for data visualization built with **Lit** and **Highcharts**.

## Features

✨ **Framework Agnostic** - Works with React, Angular, Vue, or vanilla JavaScript
🎨 **Themeable** - Automatically adapts to your app's theme via CSS custom properties
📊 **Powerful Charts** - Built on Highcharts for professional visualizations
🎯 **TypeScript First** - Full type safety and autocomplete
⚡ **Lightweight** - Lit core is only ~5KB, components lazy-load Highcharts
🔧 **Customizable** - Extensive configuration options for all components

## Components

### Core Components

- **`<viz-chart>`** - Universal chart component (line, bar, pie, area)
- **`<viz-dashboard>`** - Responsive dashboard layout
- **`<viz-widget>`** - Widget wrapper with header/footer
- **`<viz-table>`** - Interactive data table with sorting, filtering, pagination
- **`<viz-heatmap>`** - Heatmap visualization
- **`<viz-treemap>`** - Treemap for hierarchical data

## Installation

```bash
# Using npm
npm install @pguerrero/viz-components

# Using yarn
yarn add @pguerrero/viz-components

# Using bun
bun add @pguerrero/viz-components
```

## Quick Start

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Viz Components Demo</title>
  </head>
  <body>
    <viz-chart type="line"></viz-chart>

    <script type="module">
      import '@pguerrero/viz-components';

      const chart = document.querySelector('viz-chart');
      chart.data = {
        series: [{ name: 'Sales', data: [1, 2, 3, 4, 5] }]
      };
    </script>
  </body>
</html>
```

### React/Next.js

```tsx
'use client';

import { useEffect, useState } from 'react';

export function ChartDemo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    import('@pguerrero/viz-components').then(() => setMounted(true));
  }, []);

  if (!mounted) return <div>Loading...</div>;

  return (
    <viz-chart
      type="line"
      data={JSON.stringify({
        series: [{ name: 'Sales', data: [1, 2, 3, 4, 5] }]
      })}
    />
  );
}
```

### Angular

```typescript
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // ...
})
export class AppModule {}

// component.ts
import '@pguerrero/viz-components';

export class ChartComponent {
  chartData = {
    series: [{ name: 'Sales', data: [1, 2, 3, 4, 5] }]
  };
}
```

```html
<!-- template.html -->
<viz-chart type="line" [attr.data]="chartData | json"></viz-chart>
```

## Theming

Components automatically consume theme from CSS custom properties. Define these variables in your app:

```css
:root {
  /* Primary colors */
  --viz-primary: #0071e3;
  --viz-bg: #ffffff;
  --viz-text: #000000;

  /* Accent colors */
  --viz-accent-purple: #9c27b0;
  --viz-accent-cyan: #00bcd4;
  --viz-accent-pink: #e91e63;

  /* Layout */
  --viz-radius: 16px;
}

.dark-mode {
  --viz-primary: #0a84ff;
  --viz-bg: #000000;
  --viz-text: #ffffff;
}
```

## Development

```bash
# Install dependencies
bun install

# Build in watch mode
bun run dev

# Build for production
bun run build

# Type check
bun run typecheck
```

## License

MIT © Paul Guerrero Linares

## Credits

Built with:
- [Lit](https://lit.dev/) - Web Components framework
- [Highcharts](https://www.highcharts.com/) - Charting library (free for personal use)
