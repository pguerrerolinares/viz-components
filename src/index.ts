/**
 * @pguerrero/viz-components
 * Framework-agnostic Web Components library for data visualization
 */

// Export base component
export { VizBaseComponent } from './base/viz-base-component.js';

// Export components
export { VizChart } from './components/chart/viz-chart.js';
export { VizStockChart } from './components/chart/viz-stock-chart.js';
export type { OHLCDataPoint, StockChartConfig } from './components/chart/viz-stock-chart.js';
export { VizStockEvolution } from './components/chart/viz-stock-evolution.js';
export { VizEventModal } from './components/chart/viz-event-modal.js';
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
  PriceDataPoint,
  MarketEvent,
  MarketEventType,
  StockEvolutionConfig,
} from './types/index.js';

// Export theme utilities
export {
  updateHighchartsThemeDOM,
  updateStockChartThemeDOM,
} from './utils/highcharts-theme.js';

// Export sample data generators for testing/demos
export {
  generateHistoricalPrices,
  getMarketEvents,
} from './utils/sample-data.js';

// Export style utilities for custom components
export { highchartsThemeStyles } from './styles/highcharts-theme.js';
export { chartHeaderStyles } from './styles/chart-header.js';
export { eventModalStyles } from './styles/event-modal.js';

// Export market event utilities
export { DEFAULT_EVENT_COLORS, EVENT_TYPE_LABELS } from './utils/market-event-constants.js';
export { createMarkerSvg, getMarkerHeight, STEM_HEIGHTS, LUCIDE_ICONS } from './utils/market-event-icons.js';

// Library version
export const VERSION = '0.1.0';
