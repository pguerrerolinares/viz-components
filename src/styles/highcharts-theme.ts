import { css } from 'lit';

/**
 * Highcharts adaptive theme CSS custom properties
 * Defines color variables on container element to override :root values
 * This ensures proper theme switching in Shadow DOM components
 */
export const highchartsThemeStyles = css`
  /* Light theme colors */
  .highcharts-light {
    --highcharts-background-color: #ffffff;
    --highcharts-color-0: #2caffe;
    --highcharts-color-1: #544fc5;
    --highcharts-color-2: #00e272;
    --highcharts-color-3: #fe6a35;
    --highcharts-color-4: #6b8abc;
    --highcharts-color-5: #d568fb;
    --highcharts-color-6: #2ee0ca;
    --highcharts-color-7: #fa4b42;
    --highcharts-color-8: #feb56a;
    --highcharts-color-9: #91e8e1;
    --highcharts-neutral-color-100: #000000;
    --highcharts-neutral-color-80: #333333;
    --highcharts-neutral-color-60: #666666;
    --highcharts-neutral-color-40: #999999;
    --highcharts-neutral-color-20: #cccccc;
    --highcharts-neutral-color-10: #e6e6e6;
    --highcharts-neutral-color-5: #f2f2f2;
    --highcharts-neutral-color-3: #f7f7f7;
    --highcharts-highlight-color-100: #0022ff;
    --highcharts-highlight-color-80: #334eff;
    --highcharts-highlight-color-60: #667aff;
    --highcharts-highlight-color-20: #ccd3ff;
    --highcharts-highlight-color-10: #e6e9ff;
  }

  /* Dark theme colors */
  .highcharts-dark {
    --highcharts-background-color: #1c1c1e;
    --highcharts-color-0: #67b7dc;
    --highcharts-color-1: #6794dc;
    --highcharts-color-2: #6771dc;
    --highcharts-color-3: #8067dc;
    --highcharts-color-4: #a367dc;
    --highcharts-color-5: #c767dc;
    --highcharts-color-6: #dc67ce;
    --highcharts-color-7: #dc67ab;
    --highcharts-color-8: #dc6788;
    --highcharts-color-9: #dc6967;
    --highcharts-neutral-color-100: #ffffff;
    --highcharts-neutral-color-80: #d9d9d9;
    --highcharts-neutral-color-60: #b3b3b3;
    --highcharts-neutral-color-40: #808080;
    --highcharts-neutral-color-20: #4d4d4d;
    --highcharts-neutral-color-10: #333333;
    --highcharts-neutral-color-5: #1a1a1a;
    --highcharts-neutral-color-3: #0d0d0d;
    --highcharts-highlight-color-100: #88b7ff;
    --highcharts-highlight-color-80: #99c3ff;
    --highcharts-highlight-color-60: #aacfff;
    --highcharts-highlight-color-20: #cce3ff;
    --highcharts-highlight-color-10: #e6f1ff;
  }
`;
