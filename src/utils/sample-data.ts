import type { PriceDataPoint, MarketEvent } from '../types/index.js';

/**
 * Generate historical S&P 500-like price data from 2000 to 2024
 * Used for demo/sample data when no real data is provided
 */
export function generateHistoricalPrices(): PriceDataPoint[] {
  const data: PriceDataPoint[] = [];
  const startDate = new Date(2000, 0, 3); // Jan 3, 2000
  const endDate = new Date(2024, 11, 31); // Dec 31, 2024

  // Key price points to simulate S&P 500 history
  const keyPoints: { date: Date; price: number }[] = [
    { date: new Date(2000, 0, 1), price: 1469 },    // Jan 2000 - Dot-com peak era
    { date: new Date(2000, 2, 24), price: 1527 },   // Mar 2000 - NASDAQ peak
    { date: new Date(2001, 8, 10), price: 1092 },   // Sep 2001 - Pre-9/11
    { date: new Date(2001, 8, 21), price: 965 },    // Sep 2001 - Post-9/11 drop
    { date: new Date(2002, 9, 9), price: 776 },     // Oct 2002 - Bear market bottom
    { date: new Date(2003, 2, 11), price: 800 },    // Mar 2003 - Iraq war start
    { date: new Date(2007, 9, 9), price: 1565 },    // Oct 2007 - Pre-crisis peak
    { date: new Date(2008, 8, 15), price: 1192 },   // Sep 2008 - Lehman collapse
    { date: new Date(2009, 2, 9), price: 676 },     // Mar 2009 - Crisis bottom
    { date: new Date(2011, 7, 8), price: 1119 },    // Aug 2011 - Debt ceiling crisis
    { date: new Date(2015, 11, 16), price: 2043 },  // Dec 2015 - Fed rate hike
    { date: new Date(2018, 11, 24), price: 2351 },  // Dec 2018 - Trade war low
    { date: new Date(2020, 1, 19), price: 3386 },   // Feb 2020 - Pre-COVID peak
    { date: new Date(2020, 2, 23), price: 2237 },   // Mar 2020 - COVID bottom
    { date: new Date(2020, 10, 9), price: 3550 },   // Nov 2020 - Vaccine rally
    { date: new Date(2022, 0, 3), price: 4796 },    // Jan 2022 - All-time high
    { date: new Date(2022, 9, 12), price: 3577 },   // Oct 2022 - Bear market low
    { date: new Date(2024, 11, 31), price: 5900 },  // Dec 2024 - Current
  ];

  // Helper to interpolate between key points
  function getPriceForDate(date: Date): number {
    const timestamp = date.getTime();

    // Find surrounding key points
    let before = keyPoints[0];
    let after = keyPoints[keyPoints.length - 1];

    if (!before || !after) return 0;

    for (let i = 0; i < keyPoints.length - 1; i++) {
      const current = keyPoints[i];
      const next = keyPoints[i + 1];
      if (!current || !next) continue;

      if (timestamp >= current.date.getTime() && timestamp <= next.date.getTime()) {
        before = current;
        after = next;
        break;
      }
    }

    // Linear interpolation
    const ratio = (timestamp - before.date.getTime()) / (after.date.getTime() - before.date.getTime());
    const basePrice = before.price + (after.price - before.price) * ratio;

    // Add daily volatility (±0.5%)
    const volatility = (Math.random() - 0.5) * 0.01 * basePrice;

    return Math.round((basePrice + volatility) * 100) / 100;
  }

  // Generate daily data points (trading days only - skip weekends)
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();

    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const price = getPriceForDate(currentDate);
      const volume = Math.floor(2000000000 + Math.random() * 3000000000); // 2-5 billion shares

      data.push({
        time: currentDate.getTime(),
        price,
        volume,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}

/**
 * Major market events from 2000-2024
 * Used for demo/sample data when no real events are provided
 */
export function getMarketEvents(): MarketEvent[] {
  return [
    {
      date: new Date(2000, 2, 10).getTime(),
      title: 'Dot-com Peak',
      description: 'NASDAQ reaches all-time high of 5,048. Tech bubble at maximum.',
      type: 'milestone',
    },
    {
      date: new Date(2001, 8, 17).getTime(),
      title: '9/11 Attacks',
      description: 'Markets closed for 4 days. S&P drops 11.6% on reopening week.',
      type: 'crisis',
    },
    {
      date: new Date(2002, 9, 9).getTime(),
      title: 'Bear Bottom',
      description: 'S&P 500 hits 776, down 49% from 2000 peak. Dot-com crash ends.',
      type: 'crash',
    },
    {
      date: new Date(2007, 9, 9).getTime(),
      title: 'Bull Peak',
      description: 'S&P 500 reaches 1,565. Housing bubble about to burst.',
      type: 'milestone',
    },
    {
      date: new Date(2008, 8, 15).getTime(),
      title: 'Lehman Collapse',
      description: 'Lehman Brothers files for bankruptcy. Global financial crisis begins.',
      type: 'crash',
    },
    {
      date: new Date(2009, 2, 9).getTime(),
      title: 'Crisis Bottom',
      description: 'S&P 500 hits 676, down 57% from 2007 peak. Start of longest bull run.',
      type: 'rally',
    },
    {
      date: new Date(2011, 7, 5).getTime(),
      title: 'Debt Crisis',
      description: 'S&P downgrades US credit rating. Markets drop 6.7% in one day.',
      type: 'policy',
    },
    {
      date: new Date(2015, 11, 16).getTime(),
      title: 'Fed Rate Hike',
      description: 'First interest rate increase since 2006. End of zero-rate policy.',
      type: 'policy',
    },
    {
      date: new Date(2020, 1, 19).getTime(),
      title: 'Pre-COVID High',
      description: 'S&P 500 reaches all-time high of 3,386 before pandemic.',
      type: 'milestone',
    },
    {
      date: new Date(2020, 2, 23).getTime(),
      title: 'COVID Crash',
      description: 'S&P 500 drops 34% in 33 days. Fastest bear market in history.',
      type: 'crash',
    },
    {
      date: new Date(2020, 10, 9).getTime(),
      title: 'Vaccine Rally',
      description: 'Pfizer vaccine news sparks massive rally. Markets surge 4%.',
      type: 'rally',
    },
    {
      date: new Date(2022, 2, 16).getTime(),
      title: 'Fed Tightening',
      description: 'Fed begins aggressive rate hike cycle to combat inflation.',
      type: 'policy',
    },
  ];
}
