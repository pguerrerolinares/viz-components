/**
 * VizSparkline - Lightweight inline chart component
 * Uses Canvas 2D for rendering, no external dependencies
 */

import { html, css, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ref, createRef } from 'lit/directives/ref.js';

export type SparklineType = 'line' | 'area' | 'bar';

/**
 * Mini inline chart for displaying trends
 *
 * @example
 * ```html
 * <viz-sparkline data="[10,20,15,30,25,40]" type="line"></viz-sparkline>
 * <viz-sparkline data="[10,20,15,30,25,40]" type="area" color="#8b5cf6"></viz-sparkline>
 * <viz-sparkline data="[10,20,15,30,25,40]" type="bar" show-last></viz-sparkline>
 * ```
 */
@customElement('viz-sparkline')
export class VizSparkline extends LitElement {
  /** Data points to display */
  @property({ type: Array })
  data: number[] = [];

  /** Chart type */
  @property({ type: String })
  type: SparklineType = 'line';

  /** Line/fill color (default: --viz-primary or #0071e3) */
  @property({ type: String })
  color = '';

  /** Show marker on minimum value */
  @property({ type: Boolean, attribute: 'show-min' })
  showMin = false;

  /** Show marker on maximum value */
  @property({ type: Boolean, attribute: 'show-max' })
  showMax = false;

  /** Show marker on last value */
  @property({ type: Boolean, attribute: 'show-last' })
  showLast = false;

  /** Canvas height in pixels */
  @property({ type: Number })
  height = 32;

  /** Canvas width in pixels (0 = auto-fill container) */
  @property({ type: Number })
  width = 0;

  /** Line width for line/area types */
  @property({ type: Number, attribute: 'line-width' })
  lineWidth = 1.5;

  /** Enable entrance animation */
  @property({ type: Boolean })
  animated = true;

  @state()
  private canvasWidth = 100;

  private canvasRef = createRef<HTMLCanvasElement>();
  private resizeObserver: ResizeObserver | null = null;
  private animationFrame: number | null = null;
  private animationProgress = 0;

  static override styles = css`
    :host {
      display: inline-block;
      vertical-align: middle;
    }

    .sparkline-container {
      position: relative;
      width: 100%;
      height: 100%;
    }

    canvas {
      display: block;
    }
  `;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setupResizeObserver();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.cleanupResizeObserver();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);

    if (
      changedProperties.has('data') ||
      changedProperties.has('type') ||
      changedProperties.has('color') ||
      changedProperties.has('height') ||
      changedProperties.has('lineWidth')
    ) {
      if (this.animated && changedProperties.has('data')) {
        this.startAnimation();
      } else {
        this.draw();
      }
    }
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const newWidth = this.width || entry.contentRect.width || 100;
        if (newWidth !== this.canvasWidth) {
          this.canvasWidth = newWidth;
          this.draw();
        }
      }
    });
    this.resizeObserver.observe(this);
  }

  private cleanupResizeObserver(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  private startAnimation(): void {
    this.animationProgress = 0;
    const startTime = performance.now();
    const duration = 300;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      this.animationProgress = Math.min(elapsed / duration, 1);
      this.draw();

      if (this.animationProgress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.animationFrame = requestAnimationFrame(animate);
  }

  private getColor(): string {
    if (this.color) return this.color;

    // Try to read CSS custom property
    const computed = getComputedStyle(this);
    return computed.getPropertyValue('--viz-primary').trim() || '#0071e3';
  }

  private draw(): void {
    const canvas = this.canvasRef.value;
    if (!canvas || this.data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = this.canvasWidth;
    const height = this.height;

    // Set canvas size with device pixel ratio
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const color = this.getColor();
    const padding = 2;
    const drawWidth = width - padding * 2;
    const drawHeight = height - padding * 2;

    // Normalize data
    const min = Math.min(...this.data);
    const max = Math.max(...this.data);
    const range = max - min || 1;

    const normalizedData = this.data.map((v) => ((v - min) / range) * drawHeight);

    // Apply animation progress
    const animatedData = this.animated
      ? normalizedData.map((v) => v * this.animationProgress)
      : normalizedData;

    if (this.type === 'bar') {
      this.drawBars(ctx, animatedData, padding, drawWidth, drawHeight, color);
    } else {
      this.drawLineOrArea(ctx, animatedData, padding, drawWidth, drawHeight, color);
    }

    // Draw markers after animation completes
    if (this.animationProgress >= 1 || !this.animated) {
      this.drawMarkers(ctx, normalizedData, padding, drawWidth, drawHeight, color);
    }
  }

  private drawLineOrArea(
    ctx: CanvasRenderingContext2D,
    data: number[],
    padding: number,
    width: number,
    height: number,
    color: string
  ): void {
    const stepX = width / (data.length - 1);

    ctx.beginPath();
    ctx.moveTo(padding, padding + height - data[0]!);

    for (let i = 1; i < data.length; i++) {
      ctx.lineTo(padding + i * stepX, padding + height - data[i]!);
    }

    if (this.type === 'area') {
      // Complete the area path
      ctx.lineTo(padding + (data.length - 1) * stepX, padding + height);
      ctx.lineTo(padding, padding + height);
      ctx.closePath();

      // Create gradient fill
      const gradient = ctx.createLinearGradient(0, padding, 0, padding + height);
      gradient.addColorStop(0, this.hexToRgba(color, 0.4));
      gradient.addColorStop(1, this.hexToRgba(color, 0.05));
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw line on top
      ctx.beginPath();
      ctx.moveTo(padding, padding + height - data[0]!);
      for (let i = 1; i < data.length; i++) {
        ctx.lineTo(padding + i * stepX, padding + height - data[i]!);
      }
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = this.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  private drawBars(
    ctx: CanvasRenderingContext2D,
    data: number[],
    padding: number,
    width: number,
    height: number,
    color: string
  ): void {
    const barGap = 1;
    const totalGaps = (data.length - 1) * barGap;
    const barWidth = Math.max(1, (width - totalGaps) / data.length);

    ctx.fillStyle = color;

    for (let i = 0; i < data.length; i++) {
      const x = padding + i * (barWidth + barGap);
      const barHeight = Math.max(1, data[i]!);
      const y = padding + height - barHeight;

      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }

  private drawMarkers(
    ctx: CanvasRenderingContext2D,
    data: number[],
    padding: number,
    width: number,
    height: number,
    color: string
  ): void {
    if (this.type === 'bar') return; // No markers for bar type

    const stepX = width / (data.length - 1);
    const markerRadius = 3;

    const drawMarker = (index: number, markerColor: string) => {
      const x = padding + index * stepX;
      const y = padding + height - data[index]!;

      ctx.beginPath();
      ctx.arc(x, y, markerRadius, 0, Math.PI * 2);
      ctx.fillStyle = markerColor;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    if (this.showMin) {
      const minIndex = data.indexOf(Math.min(...data));
      drawMarker(minIndex, '#ef4444');
    }

    if (this.showMax) {
      const maxIndex = data.indexOf(Math.max(...data));
      drawMarker(maxIndex, '#22c55e');
    }

    if (this.showLast) {
      drawMarker(data.length - 1, color);
    }
  }

  private hexToRgba(hex: string, alpha: number): string {
    // Handle rgb/rgba formats
    if (hex.startsWith('rgb')) {
      const match = hex.match(/[\d.]+/g);
      if (match && match.length >= 3) {
        return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${alpha})`;
      }
    }

    // Handle hex format
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1]!, 16);
      const g = parseInt(result[2]!, 16);
      const b = parseInt(result[3]!, 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    return hex;
  }

  protected override render() {
    const width = this.width || '100%';
    const height = this.height;

    return html`
      <div
        class="sparkline-container"
        style="width: ${typeof width === 'number' ? `${width}px` : width}; height: ${height}px;"
      >
        <canvas ${ref(this.canvasRef)} part="canvas"></canvas>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'viz-sparkline': VizSparkline;
  }
}
