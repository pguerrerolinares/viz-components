/**
 * Type definitions for viz-components library
 */

// Chart types
export type ChartType = 'line' | 'bar' | 'column' | 'pie' | 'area';

export interface ChartSeries {
  name: string;
  data: number[] | [number, number][];
  type?: ChartType;
  color?: string;
}

export interface ChartData {
  categories?: string[];
  series: ChartSeries[];
}

export interface ChartConfig {
  title?: string;
  subtitle?: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
  legend?: boolean;
  tooltip?: boolean;
  animation?: boolean;
}

// Dashboard types
export type DashboardLayout = 'grid' | 'masonry' | 'flex';

export interface DashboardConfig {
  columns?: number;
  gap?: number;
  layout?: DashboardLayout;
}

// Widget types
export interface WidgetConfig {
  title?: string;
  subtitle?: string;
  span?: number;
  height?: string;
  loading?: boolean;
  error?: string;
}

// Table types
export interface TableColumn<T = unknown> {
  key: keyof T & string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  formatter?: (value: unknown) => string;
}

export interface TableConfig {
  sortable?: boolean;
  filterable?: boolean;
  paginate?: boolean;
  pageSize?: number;
  selectable?: boolean;
  multiSelect?: boolean;
}

// Heatmap types
export interface HeatmapDataPoint {
  x: number;
  y: number;
  value: number;
}

export interface HeatmapConfig {
  xCategories?: string[];
  yCategories?: string[];
  colorAxis?: {
    min?: number;
    max?: number;
    stops?: [number, string][];
  };
}

// Treemap types
export interface TreemapNode {
  id: string;
  name: string;
  value: number;
  parent?: string;
  color?: string;
}

export interface TreemapConfig {
  allowDrillDown?: boolean;
  levelIsConstant?: boolean;
  layoutAlgorithm?: 'squarified' | 'stripes' | 'strip' | 'sliceAndDice';
}

// Theme types
export interface ThemeColors {
  primary: string;
  background: string;
  text: string;
  palette: string[];
}

// Event types
export interface VizChartEvent {
  type: 'click' | 'hover' | 'select';
  seriesIndex?: number;
  pointIndex?: number;
  value?: unknown;
}

export interface VizTableEvent<T = unknown> {
  type: 'sort' | 'filter' | 'select' | 'page';
  column?: string;
  direction?: 'asc' | 'desc';
  selectedRows?: T[];
}
