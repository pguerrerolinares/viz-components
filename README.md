# @pguerrerolinares/viz-components

Framework-agnostic Web Components library for data visualization. Built with Lit and Highcharts.

## Features

- Native Web Components - works with any framework (React, Angular, Vue, vanilla JS)
- Built with Lit for optimal developer experience
- Theming via CSS custom properties
- TypeScript support with full type definitions
- Shadow DOM encapsulation

## Installation

```bash
npm install @pguerrerolinares/viz-components highcharts
# or
bun add @pguerrerolinares/viz-components highcharts
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
- `config` - JSON object with title, subtitle, axis titles, and `highcharts` for full customization

**Highcharts Customization:**

Pass any [Highcharts options](https://api.highcharts.com/highcharts/) via the `config.highcharts` property:

```html
<viz-chart
  type="line"
  data='[{"name": "Sales", "data": [30, 40, 35, 50, 49]}]'
  config='{
    "title": "Custom Chart",
    "highcharts": {
      "tooltip": {
        "backgroundColor": "#333",
        "style": { "color": "#fff" },
        "borderRadius": 8
      },
      "legend": {
        "layout": "vertical",
        "align": "right"
      },
      "plotOptions": {
        "line": {
          "lineWidth": 3,
          "marker": { "radius": 6 }
        }
      }
    }
  }'
></viz-chart>
```

### viz-stock-chart

Real-time candlestick chart with OHLC data and volume.

```html
<viz-stock-chart
  data='[{"time": 1702900800000, "open": 100, "high": 105, "low": 98, "close": 103, "volume": 1000000}]'
  config='{"symbol": "AAPL", "currency": "$", "showVolume": true, "realtime": true}'
  theme="auto"
></viz-stock-chart>
```

**Attributes:**
- `data` - JSON array of OHLC data points with `time`, `open`, `high`, `low`, `close`, `volume`
- `config` - JSON object with:
  - `symbol` - Stock symbol to display
  - `currency` - Currency symbol (default: "$")
  - `showVolume` - Show volume bars (default: true)
  - `realtime` - Enable simulated real-time updates (default: false)
  - `realtimeInterval` - Update interval in ms (default: 1000)
  - `highcharts` - Pass-through Highcharts options
- `theme` - Theme mode: `light`, `dark`, or `auto`

**Events:**
- `price-update` - Fired on real-time price updates with `{ detail: { time, open, high, low, close, volume, change, changePercent } }`

**Methods:**
- `addPoint(point)` - Add a new OHLC data point
- `setData(data)` - Replace all data

### viz-stock-evolution

Historical stock evolution chart with market event markers.

```html
<viz-stock-evolution
  config='{"symbol": "S&P 500", "currency": "$", "showEvents": true, "showVolume": false}'
  theme="auto"
></viz-stock-evolution>
```

**Attributes:**
- `prices` - JSON array of price points with `time`, `price`, `volume`
- `events` - JSON array of market events with `date`, `title`, `description`, `type`
- `config` - JSON object with:
  - `symbol` - Symbol name to display
  - `currency` - Currency symbol (default: "$")
  - `showEvents` - Show event markers (default: true)
  - `showVolume` - Show volume bars (default: false)
  - `areaColor` - Color for the area fill
  - `eventColors` - Custom colors per event type
  - `highcharts` - Pass-through Highcharts options
- `theme` - Theme mode: `light`, `dark`, or `auto`

**Event Types:**
- `crash` - Market crash (red)
- `rally` - Market rally (green)
- `policy` - Policy change (amber)
- `crisis` - Crisis event (dark red)
- `milestone` - Market milestone (blue)

**Methods:**
- `setData(prices, events?)` - Set price and event data
- `addEvent(event)` - Add a new market event

**Note:** If no data is provided, sample S&P 500 historical data (2000-2024) is loaded automatically for demonstration.

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

## Styling

### CSS Custom Properties

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

### CSS Parts

Components expose CSS parts for styling from the parent. Use `::part()` selector:

```css
/* Style widget parts */
viz-widget::part(widget) {
  border: 2px solid #ccc;
}
viz-widget::part(title) {
  font-size: 1.5rem;
  color: navy;
}
viz-widget::part(header) {
  background: linear-gradient(to right, #f0f0f0, #fff);
}

/* Style table parts */
viz-table::part(table) {
  border: 1px solid #ddd;
}
viz-table::part(filter-input) {
  border-radius: 20px;
}
```

**Available parts:**

| Component | Parts |
|-----------|-------|
| viz-chart | `chart` |
| viz-stock-chart | `header`, `symbol`, `price`, `change`, `live-indicator`, `chart` |
| viz-stock-evolution | `header`, `symbol`, `price`, `change`, `info`, `chart`, `modal-overlay`, `modal` |
| viz-dashboard | `dashboard` |
| viz-widget | `widget`, `header`, `title`, `subtitle`, `content`, `footer`, `loading`, `spinner` |
| viz-table | `wrapper`, `toolbar`, `filter-input`, `table`, `thead`, `tbody` |
| viz-heatmap | `chart` |
| viz-treemap | `chart` |

## Framework Integration

### Vanilla HTML

```html
<script type="module">
  import '@pguerrerolinares/viz-components';
</script>

<viz-chart type="line" data='[{"name": "Data", "data": [1, 2, 3]}]'></viz-chart>
```

### React/Next.js

```tsx
'use client';
import { useEffect } from 'react';

export default function Chart() {
  useEffect(() => {
    import('@pguerrerolinares/viz-components');
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
import '@pguerrerolinares/viz-components';

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
