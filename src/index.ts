/**
 * @pguerrero/viz-components
 * Framework-agnostic Web Components library for data visualization
 */

// Export core utilities
export {
  // Events
  createVizEvent,
  emitVizEvent,
  type EventEmitterHost,
  // Theme
  ThemeController,
  getCSSProperty,
  readThemeColors,
  readThemePalette,
  // Lifecycle
  PropertyWatchController,
  // Lazy
  LazyInitController,
  // Store
  VizStore,
  StoreController,
} from './core/index.js';

// Export base components
export { VizBaseComponent } from './base/viz-base-component.js';
export { VizHighchartsComponent } from './base/viz-highcharts-component.js';
export { VizStockChartBase } from './base/viz-stock-chart-base.js';
export type { ChangeInfo } from './base/viz-stock-chart-base.js';

// Export components
export { VizChart } from './components/chart/viz-chart.js';
export { VizStockChart } from './components/chart/viz-stock-chart.js';
export { VizStockEvolution } from './components/chart/viz-stock-evolution.js';
export { VizEventModal } from './components/chart/viz-event-modal.js';
export { VizDashboard } from './components/dashboard/viz-dashboard.js';
export { VizWidget } from './components/dashboard/viz-widget.js';
export { VizTable } from './components/table/viz-table.js';
export { VizHeatmap } from './components/advanced/viz-heatmap.js';
export { VizTreemap } from './components/advanced/viz-treemap.js';

// Export micro components (lightweight, no Highcharts)
export { VizSparkline } from './components/micro/viz-sparkline.js';
export { VizKPI } from './components/micro/viz-kpi.js';
export { VizStatus } from './components/micro/viz-status.js';

// Export types
export type {
  // Core types
  ThemeMode,
  ThemeState,
  CoreThemeColors,
  // Event types
  VizEventDetail,
  VizCustomEvent,
  PointClickData,
  SeriesClickData,
  ZoomData,
  LegendToggleData,
  SortData,
  FilterData,
  SelectData,
  PageData,
  ExpandData,
  RefreshData,
  ThemeChangeData,
  StateChangeData,
  VizEventName,
  // Store types
  StoreNamespace,
  StateSubscriber,
  VizStoreOptions,
  StoreControllerOptions,
  // Chart types
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
  OHLCDataPoint,
  StockChartConfig,
  PriceDataPoint,
  MarketEvent,
  MarketEventType,
  StockEvolutionConfig,
  // Micro component types
  SparklineType,
  SparklineConfig,
  KPIFormat,
  ComponentSize,
  KPIThresholds,
  KPIConfig,
  StatusType,
  StatusConfig,
} from './types/index.js';

export { VizEventNames } from './types/index.js';

// Export sample data generators for testing/demos
export {
  generateHistoricalPrices,
  getMarketEvents,
  generateOHLCData,
  generateChartData,
  generateHeatmapData,
  generateTreemapData,
} from './utils/sample-data.js';

// Export market event constants for customization
export { DEFAULT_EVENT_COLORS, EVENT_TYPE_LABELS } from './utils/market-event-constants.js';

// Export layout utilities
export { calculateFlagStemHeights } from './utils/flag-layout.js';
export type { EventWithPosition, FlagLayoutOptions } from './utils/flag-layout.js';

// Export number formatting utilities
export {
  formatNumber,
  formatChange,
  formatPercentChange,
  calculatePercentChange,
  type NumberFormat,
  type FormatOptions,
} from './utils/number-format.js';

// Library version
export const VERSION = '2.0.0';
