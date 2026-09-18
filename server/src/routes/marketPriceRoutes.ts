import { Router, Request, Response } from 'express';
import { marketPriceService } from '../services/marketPriceService.js';

const router = Router();

/**
 * GET /api/market-prices/daily
 * Query params: district, mandiId, category, search, forceRefresh
 */
router.get('/daily', async (req: Request, res: Response) => {
  try {
    const district = (req.query.district as string) || 'All';
    const mandiId = req.query.mandiId as string | undefined;
    const category = (req.query.category as string)?.toUpperCase().trim();
    const search = (req.query.search as string)?.toLowerCase().trim();

    const summary = await marketPriceService.getDailyRates(district, mandiId);
    const availableMandis = marketPriceService.getAvailableMandis();

    let rates = summary.rates;
    if (category && category !== 'ALL') {
      rates = rates.filter((r) => r.category === category);
    }
    if (search) {
      rates = rates.filter(
        (r) =>
          r.name.toLowerCase().includes(search) ||
          r.nameTamil.includes(search) ||
          r.category.toLowerCase().includes(search) ||
          r.district.toLowerCase().includes(search) ||
          r.mandi.toLowerCase().includes(search)
      );
    }

    res.json({
      success: true,
      availableMandis,
      summary: {
        ...summary,
        rates,
      },
    });
  } catch (error: any) {
    console.error('Error fetching live market prices:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch live market prices' });
  }
});

/**
 * GET /api/market-prices/ticker
 * Lightweight ticker rates for top header
 */
router.get('/ticker', async (req: Request, res: Response) => {
  try {
    const district = (req.query.district as string) || 'All';
    const ticker = await marketPriceService.getTickerRates(district);
    res.json({ success: true, ticker });
  } catch (error: any) {
    console.error('Error fetching ticker:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ticker' });
  }
});

/**
 * GET /api/market-prices/mandis
 * List all available Mandi markets and discovered districts
 */
router.get('/mandis', (req: Request, res: Response) => {
  const mandis = marketPriceService.getAvailableMandis();
  res.json({ success: true, mandis });
});

/**
 * POST /api/market-prices/sync
 * Manually trigger live sync with data.gov.in
 */
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const result = await marketPriceService.syncGovMandiPrices(true);
    const summary = await marketPriceService.getDailyRates('All');
    res.json({
      success: true,
      message: 'Successfully synced latest mandi rates from data.gov.in',
      ...result,
      summary,
    });
  } catch (error: any) {
    console.error('Error syncing market prices:', error);
    res.status(500).json({ success: false, error: 'Failed to sync with data.gov.in' });
  }
});

export default router;
