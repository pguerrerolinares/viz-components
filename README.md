# @pguerrerolinares/viz-components

Framework-agnostic Web Components library for data visualization. Built with Lit and Highcharts.

## Features

- Native Web Components - works with any framework (React, Angular, Vue, vanilla JS)
- Built with Lit for optimal developer experience
- Theming via CSS custom properties with automatic light/dark detection
- TypeScript support with full type definitions
- Shadow DOM encapsulation
- Lazy loading - charts render only when visible (IntersectionObserver)
- Standardized event system across all components
- Reactive Controllers for theme, property watching, and lazy initialization

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
<!-- Demo mode with sample data -->
<viz-chart demo type="line"></viz-chart>

<!-- With custom data -->
<viz-chart
  type="line"
  data='[{"name": "Sales", "data": [30, 40, 35, 50, 49]}]'
  categories='["Jan", "Feb", "Mar", "Apr", "May"]'
  config='{"title": "Monthly Sales"}'
></viz-chart>
```

**Attributes:**
- `demo` - Enable demo mode with sample data
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
<!-- Demo mode with sample OHLC data -->
<viz-stock-chart demo config='{"symbol": "AAPL", "realtime": true}'></viz-stock-chart>

<!-- With custom data -->
<viz-stock-chart
  data='[{"time": 1702900800000, "open": 100, "high": 105, "low": 98, "close": 103, "volume": 1000000}]'
  config='{"symbol": "AAPL", "currency": "$", "showVolume": true, "realtime": true}'
  theme="auto"
></viz-stock-chart>
```

**Attributes:**
- `demo` - Enable demo mode with sample OHLC data (100 days)
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
<!-- Demo mode with sample data -->
<viz-stock-evolution demo></viz-stock-evolution>

<!-- With custom data -->
<viz-stock-evolution
  .prices=${myPrices}
  .events=${myEvents}
  config='{"symbol": "NASDAQ", "currency": "$"}'
></viz-stock-evolution>
```

**Attributes:**
- `demo` - Enable demo mode with sample S&P 500 data (2000-2024)
- `prices` - Array of price points with `time`, `price`, `volume`
- `events` - Array of market events with `date`, `title`, `description`, `type`
- `config` - JSON object with:
  - `symbol` - Symbol name to display (default: "S&P 500")
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
<!-- Demo mode with sample data -->
<viz-heatmap demo title="Weekly Activity"></viz-heatmap>

<!-- With custom data -->
<viz-heatmap
  title="Weekly Activity"
  data='[{"x": 0, "y": 0, "value": 10}, {"x": 1, "y": 0, "value": 20}]'
  x-categories='["Mon", "Tue", "Wed"]'
  y-categories='["Morning", "Afternoon"]'
></viz-heatmap>
```

**Attributes:**
- `demo` - Enable demo mode with sample weekly activity data
- `title` - Chart title
- `data` - JSON array of data points with `x`, `y`, `value`
- `x-categories` - JSON array of x-axis category labels
- `y-categories` - JSON array of y-axis category labels
- `config` - JSON object with `colorAxis` settings and `highcharts` for full customization

### viz-treemap

Treemap visualization for hierarchical data.

```html
<!-- Demo mode with sample data -->
<viz-treemap demo title="Project Breakdown"></viz-treemap>

<!-- With custom data -->
<viz-treemap
  title="Project Breakdown"
  data='[{"id": "react", "name": "React", "value": 40}]'
></viz-treemap>
```

**Attributes:**
- `demo` - Enable demo mode with sample technology breakdown data
- `title` - Chart title
- `data` - JSON array of nodes with `id`, `name`, `value`, optional `parent`
- `config` - JSON object with `layoutAlgorithm`, `allowDrillDown`, and `highcharts` for full customization

## Micro Components (Lightweight)

These components are lightweight and don't require Highcharts. They use Canvas or pure CSS for rendering.

### viz-sparkline

Lightweight inline chart using Canvas 2D.

```html
<viz-sparkline data="[10,20,15,30,25,40]" type="line"></viz-sparkline>
<viz-sparkline data="[10,20,15,30,25,40]" type="area" color="#8b5cf6"></viz-sparkline>
<viz-sparkline data="[10,20,15,30,25,40]" type="bar" show-min show-max></viz-sparkline>
```

**Attributes:**
- `data` - Array of numeric values
- `type` - Chart type: `line`, `area`, `bar` (default: `line`)
- `color` - Line/fill color (default: `--viz-primary`)
- `height` - Height in pixels (default: 32)
- `width` - Width in pixels (0 = auto-fill container)
- `line-width` - Stroke width for line/area (default: 1.5)
- `show-min` - Show marker on minimum value
- `show-max` - Show marker on maximum value
- `show-last` - Show marker on last value
- `animated` - Enable entrance animation (default: true)

### viz-kpi

Key Performance Indicator card with value, trend indicator, and optional sparkline.

```html
<viz-kpi
  value="1234"
  label="Revenue"
  prefix="$"
  format="compact"
  previous-value="1100"
  trend="[100,120,115,130,125,140]"
></viz-kpi>

<viz-kpi
  value="42.5"
  label="Bounce Rate"
  unit="%"
  decimals="1"
  previous-value="48.2"
  invert-trend
></viz-kpi>
```

**Attributes:**
- `value` - Current numeric value
- `label` - KPI label/title
- `unit` - Unit suffix (e.g., "%", "ms")
- `prefix` - Value prefix (e.g., "$", "€")
- `previous-value` - Previous value for calculating change percentage
- `trend` - Array of values for sparkline
- `format` - Number format: `number`, `currency`, `percent`, `compact`
- `decimals` - Decimal places to show
- `size` - Component size: `small`, `medium`, `large`
- `invert-trend` - Invert trend colors (lower is better)
- `thresholds` - Object with `warning` and `critical` values for color coding

**Events:**
- `viz-kpi-click` - Fired when clicking the KPI card

### viz-status

Semantic status indicator with icon and color.

```html
<viz-status status="success" label="API" value="Operational"></viz-status>
<viz-status status="warning" label="Database" value="High Load" pulse></viz-status>
<viz-status status="error" label="Cache" value="Down"></viz-status>
<viz-status status="info" label="Deploy" value="In Progress"></viz-status>
<viz-status status="neutral" label="Backup" value="Scheduled"></viz-status>
```

**Attributes:**
- `status` - Status type: `success`, `warning`, `error`, `info`, `neutral`
- `label` - Status label
- `value` - Optional value text
- `size` - Component size: `small`, `medium`, `large`
- `pulse` - Enable pulse animation
- `show-icon` - Show status icon (default: true)
- `icon` - Custom SVG icon string

**Events:**
- `viz-status-click` - Fired when clicking the status indicator

## Events

All components emit standardized events with a consistent structure:

```typescript
interface VizEventDetail<T> {
  source: string;      // Component tag name (e.g., 'viz-chart')
  timestamp: number;   // When the event occurred
  data: T;             // Event-specific payload
}
```

### Available Events

| Event | Components | Data |
|-------|-----------|------|
| `viz-point-click` | viz-chart, viz-heatmap, viz-treemap | `{ point, series?, category? }` |
| `viz-series-click` | viz-chart | `{ series }` |
| `viz-theme-change` | All | `{ theme: 'light' \| 'dark', mode }` |
| `viz-sort` | viz-table | `{ column, direction }` |
| `viz-filter` | viz-table | `{ column, value }` |
| `viz-select` | viz-table | `{ rows }` |
| `viz-page` | viz-table | `{ page, pageSize }` |

### Listening to Events

```javascript
document.addEventListener('viz-point-click', (event) => {
  const { source, timestamp, data } = event.detail;
  console.log(`Click on ${source}:`, data.point);
});

// Or on specific component
const chart = document.querySelector('viz-chart');
chart.addEventListener('viz-point-click', (e) => {
  console.log('Point clicked:', e.detail.data);
});
```

## Lazy Loading

Chart components support lazy loading via IntersectionObserver. Charts only render when they become visible in the viewport, improving initial page load performance.

```html
<!-- Lazy loading enabled by default -->
<viz-chart demo type="line"></viz-chart>

<!-- Disable lazy loading for immediate render -->
<viz-chart demo type="line" lazy="false"></viz-chart>
```

**Attributes:**
- `lazy` - Enable/disable lazy loading (default: `true`)

The lazy loading uses a 100px root margin, so charts start rendering slightly before they enter the viewport.

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
| viz-stock-evolution | `header`, `symbol`, `price`, `change`, `info`, `chart` |
| viz-event-modal | `overlay`, `modal` |
| viz-dashboard | `dashboard` |
| viz-widget | `widget`, `header`, `title`, `subtitle`, `content`, `footer`, `loading`, `spinner` |
| viz-table | `wrapper`, `toolbar`, `filter-input`, `table`, `thead`, `tbody` |
| viz-heatmap | `chart` |
| viz-treemap | `chart` |
| viz-sparkline | `canvas` |
| viz-kpi | `container`, `label`, `value`, `change`, `sparkline` |
| viz-status | `container`, `indicator`, `icon`, `label`, `value` |

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

### Legacy Projects (JSP, vanilla HTML)

For projects without a module bundler, use the IIFE bundle:

```bash
# Build the IIFE bundle
bun run build:iife
```

```html
<!-- Include Highcharts (peer dependency) -->
<script src="https://code.highcharts.com/highcharts.js"></script>
<script src="https://code.highcharts.com/modules/stock.js"></script>

<!-- Include the bundle -->
<script src="dist/viz-components.bundle.js"></script>

<!-- Use components directly -->
<viz-chart type="line" data='[{"name": "Sales", "data": [1, 2, 3]}]'></viz-chart>
<viz-stock-evolution demo></viz-stock-evolution>
```

Components auto-register when the script loads via `@customElement()` decorators.

## Extending Components

The library exports base classes and reactive controllers for creating custom components:

```typescript
import {
  VizHighchartsComponent,
  ThemeController,
  LazyInitController,
  emitVizEvent,
  VizEventNames
} from '@pguerrerolinares/viz-components';

@customElement('my-custom-chart')
class MyCustomChart extends VizHighchartsComponent {
  protected getWatchedProperties(): string[] {
    return ['data', 'config', 'theme', 'demo'];
  }

  protected loadDemoData(): void {
    // Load sample data when demo=true
  }

  protected updateChart(): void {
    // Create/update Highcharts chart
    const container = this.containerRef.value;
    if (!container) return;
    // ... Highcharts initialization
  }
}
```

**Available base classes:**
- `VizBaseComponent` - Base for all components (theme detection, event emission)
- `VizHighchartsComponent` - Base for Highcharts charts (lifecycle, demo prop, lazy loading)
- `VizStockChartBase` - Base for stock charts (zoom preservation, range selector helpers)

**Reactive Controllers:**
- `ThemeController` - Automatic light/dark theme detection from document classes
- `LazyInitController` - IntersectionObserver-based lazy initialization
- `PropertyWatchController` - Debounced property change watching

**Event Utilities:**
- `emitVizEvent(host, eventName, data)` - Emit standardized events
- `VizEventNames` - Constants for all event names

## Sample Data Generators

The library exports data generators for testing and development:

```typescript
import {
  generateChartData,      // Returns { series, categories } for viz-chart
  generateOHLCData,       // Returns OHLC data array for viz-stock-chart
  generateHistoricalPrices, // Returns price data for viz-stock-evolution
  getMarketEvents,        // Returns market events for viz-stock-evolution
  generateHeatmapData,    // Returns { data, xCategories, yCategories } for viz-heatmap
  generateTreemapData,    // Returns nodes array for viz-treemap
} from '@pguerrerolinares/viz-components';

// Example: programmatically load data
const chart = document.querySelector('viz-chart');
const { series, categories } = generateChartData();
chart.data = series;
chart.categories = categories;
```

## Core Exports

The library also exports core utilities for building custom components:

```typescript
import {
  // Event system
  VizEventNames,          // Event name constants
  emitVizEvent,           // Emit standardized events

  // Reactive Controllers
  ThemeController,        // Theme detection controller
  LazyInitController,     // Lazy loading controller
  PropertyWatchController, // Property watching controller

  // Theme utilities
  getCSSProperty,         // Read CSS custom property with fallback
  readThemeColors,        // Read core theme colors
  readThemePalette,       // Read extended palette

  // Layout utilities
  calculateFlagStemHeights, // Collision-aware flag positioning

  // Number formatting
  formatNumber,           // Format numbers with locale support
  formatChange,           // Format change values (+/-)
  formatPercentChange,    // Format percentage changes

  // Types
  type VizEventDetail,
  type ThemeMode,
  type ThemeState,
  type SparklineType,
  type ComponentSize,
  type StatusType,
} from '@pguerrerolinares/viz-components';
```

## Browser Support

- Chrome/Edge (Full support)
- Firefox (Full support)
- Safari (Full support, iOS 10.3+)

## License

MIT
