import type { MarketEventType } from '../types/index.js';

/**
 * Lucide icon SVG paths (inner content only, without svg wrapper)
 */
export const LUCIDE_PATHS: Record<MarketEventType, string> = {
  crash: `<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>`,
  rally: `<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>`,
  policy: `<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>`,
  crisis: `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>`,
  milestone: `<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>`,
};

/**
 * Full Lucide SVG icons for modal display
 */
export const LUCIDE_ICONS: Record<MarketEventType, string> = {
  crash: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${LUCIDE_PATHS.crash}</svg>`,
  rally: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${LUCIDE_PATHS.rally}</svg>`,
  policy: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${LUCIDE_PATHS.policy}</svg>`,
  crisis: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${LUCIDE_PATHS.crisis}</svg>`,
  milestone: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${LUCIDE_PATHS.milestone}</svg>`,
};

/**
 * Calendar icon for date display in modal
 */
export const CALENDAR_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`;

/**
 * Stem height levels for staggering close flags
 */
export const STEM_HEIGHTS = {
  short: 20,
  medium: 35,
  long: 50,
} as const;

/**
 * Generate a flag marker SVG with stem and centered icon badge.
 * The marker has a vertical stem at bottom and circular badge at top.
 * SVG is padded so the center aligns with the stem bottom (anchor point).
 */
export function createMarkerSvg(
  type: MarketEventType,
  bgColor: string,
  stemHeight: number = STEM_HEIGHTS.medium
): string {
  const iconPath = LUCIDE_PATHS[type];
  const badgeRadius = 14;
  const badgeDiameter = badgeRadius * 2;
  const stemWidth = 2.5;

  // Visual content height: badge + stem
  const contentHeight = badgeDiameter + stemHeight;

  // Total SVG height is doubled so center = bottom of stem
  const totalHeight = contentHeight * 2;
  const totalWidth = badgeDiameter + 4;
  const centerX = totalWidth / 2;

  // Badge center position
  const badgeCenterY = badgeRadius + 2;
  const stemStartY = badgeDiameter + 2;
  const stemEndY = contentHeight;

  // Icon scale (16px icon in 28px badge)
  const iconScale = 0.65;
  const iconTranslateX = centerX - 12 * iconScale;
  const iconTranslateY = badgeCenterY - 12 * iconScale;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
    <line x1="${centerX}" y1="${stemStartY}" x2="${centerX}" y2="${stemEndY}" stroke="${bgColor}" stroke-width="${stemWidth}" stroke-linecap="round"/>
    <circle cx="${centerX}" cy="${stemEndY}" r="3" fill="${bgColor}"/>
    <circle cx="${centerX}" cy="${badgeCenterY}" r="${badgeRadius}" fill="${bgColor}" stroke="white" stroke-width="2.5"/>
    <g transform="translate(${iconTranslateX.toFixed(2)}, ${iconTranslateY.toFixed(2)}) scale(${iconScale})" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${iconPath}
    </g>
  </svg>`;

  return `url(data:image/svg+xml;base64,${btoa(svg)})`;
}

/**
 * Calculate marker height based on stem height (for Highcharts positioning)
 */
export function getMarkerHeight(stemHeight: number): number {
  const badgeDiameter = 28;
  return (badgeDiameter + stemHeight) * 2;
}
