# @pguerrero/viz-components

Framework-agnostic Web Components library for data visualization. Built with Lit and Highcharts.

## Features

- Native Web Components - works with any framework (React, Angular, Vue, vanilla JS)
- Built with Lit for optimal developer experience
- Theming via CSS custom properties
- TypeScript support with full type definitions
- Shadow DOM encapsulation

## Installation

```bash
npm install @pguerrero/viz-components highcharts
# or
bun add @pguerrero/viz-components highcharts
```

## Components

### viz-chart

Universal chart component supporting line, bar, column, pie, and area charts.

```html
<viz-chart
  type="line"
  data='[{"name": "Sales", "data": [30, 40, 35, 50, 49]}]'
  categories='["Jan", "Feb", "Mar", "Apr", "May"]'
  config='{"title": "Monthly Sales"}'
></viz-chart>
```

**Attributes:**
- `type` - Chart type: `line`, `bar`, `column`, `pie`, `area`
- `data` - JSON array of series data
- `categories` - JSON array of x-axis categories
- `config` - JSON object with title, subtitle, axis titles, etc.

### viz-dashboard

Grid layout container for widgets.

```html
<viz-dashboard columns="3" gap="16" layout="grid">
  <viz-widget title="Revenue">...</viz-widget>
  <viz-widget title="Users">...</viz-widget>
</viz-dashboard>
```

**Attributes:**
- `columns` - Number of grid columns (default: 2)
- `gap` - Gap between widgets in pixels (default: 16)
- `layout` - Layout mode: `grid`, `masonry`, `flex`

### viz-widget

Widget wrapper with header, loading state, and slots.

```html
<viz-widget title="Revenue" subtitle="Monthly" span="2">
  <viz-chart type="area" ...></viz-chart>
  <div slot="footer">Updated: Today</div>
</viz-widget>
```

**Attributes:**
- `title` - Widget title
- `subtitle` - Widget subtitle
- `span` - Column span in dashboard grid
- `height` - Widget height (number or "auto")

### viz-table

Interactive data table with sorting, filtering, and pagination.

```html
<viz-table
  data='[{"id": 1, "name": "Alice", "role": "Developer"}]'
  columns='[{"key": "name", "header": "Name", "sortable": true}]'
  config='{"sortable": true, "filterable": true, "paginate": true, "pageSize": 10}'
></viz-table>
```

**Attributes:**
- `data` - JSON array of row objects
- `columns` - JSON array of column definitions
- `config` - JSON object with sortable, filterable, paginate, pageSize, selectable

**Events:**
- `sort-change` - Fired when sort changes
- `filter-change` - Fired when filter changes
- `row-select` - Fired when row selection changes
- `page-change` - Fired when page changes

### viz-heatmap

Heatmap visualization for displaying data intensity.

```html
<viz-heatmap
  title="Weekly Activity"
  data='[{"x": 0, "y": 0, "value": 10}, {"x": 1, "y": 0, "value": 20}]'
  x-categories='["Mon", "Tue", "Wed"]'
  y-categories='["Morning", "Afternoon"]'
></viz-heatmap>
```

### viz-treemap

Treemap visualization for hierarchical data.

```html
<viz-treemap
  title="Project Breakdown"
  data='[{"id": "react", "name": "React", "value": 40}]'
></viz-treemap>
```

## Theming

Components use CSS custom properties for theming. Set these on your root element:

```css
:root {
  --viz-primary: #0071e3;
  --viz-bg: #ffffff;
  --viz-text: #1d1d1f;
  --viz-accent-purple: #6366f1;
  --viz-accent-cyan: #0d9488;
  --viz-accent-pink: #ec4899;
  --viz-radius: 16px;
}

/* Dark mode */
.dark {
  --viz-primary: #0a84ff;
  --viz-bg: #1c1c1e;
  --viz-text: #f5f5f7;
}
```

## Framework Integration

### Vanilla HTML

```html
<script type="module">
  import '@pguerrero/viz-components';
</script>

<viz-chart type="line" data='[{"name": "Data", "data": [1, 2, 3]}]'></viz-chart>
```

### React/Next.js

```tsx
'use client';
import { useEffect } from 'react';

export default function Chart() {
  useEffect(() => {
    import('@pguerrero/viz-components');
  }, []);

  return (
    <viz-chart
      type="line"
      data={JSON.stringify([{ name: 'Sales', data: [1, 2, 3] }])}
    />
  );
}
```

### Angular

```typescript
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import '@pguerrero/viz-components';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

```html
<viz-chart [attr.data]="chartData | json"></viz-chart>
```

## Browser Support

- Chrome/Edge (Full support)
- Firefox (Full support)
- Safari (Full support, iOS 10.3+)

## License

MIT
