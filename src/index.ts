/**
 * @pguerrero/viz-components
 * Framework-agnostic Web Components library for data visualization
 */

// Export base component
export { VizBaseComponent } from './base/viz-base-component.js';

// Export components
export { VizChart } from './components/chart/viz-chart.js';
export { VizDashboard } from './components/dashboard/viz-dashboard.js';
export { VizWidget } from './components/dashboard/viz-widget.js';
export { VizTable } from './components/table/viz-table.js';
export { VizHeatmap } from './components/advanced/viz-heatmap.js';
export { VizTreemap } from './components/advanced/viz-treemap.js';

// Export types
export type {
  ChartType,
  ChartSeries,
  ChartData,
  ChartConfig,
  DashboardLayout,
  DashboardConfig,
  WidgetConfig,
  TableColumn,
  TableConfig,
  HeatmapDataPoint,
  HeatmapConfig,
  TreemapNode,
  TreemapConfig,
  ThemeColors,
  VizChartEvent,
  VizTableEvent,
} from './types/index.js';

// Library version
export const VERSION = '0.1.0';
