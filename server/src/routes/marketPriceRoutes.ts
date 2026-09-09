import { Router, Request, Response } from 'express';
import { marketPriceService, MANDIS } from '../services/marketPriceService.js';

const router = Router();

/**
 * GET /api/market-prices/daily
 * Query params: district, mandiId, search
 */
router.get('/daily', async (req: Request, res: Response) => {
  try {
    const district = (req.query.district as string) || 'Salem';
    const mandiId = req.query.mandiId as string | undefined;
    const search = (req.query.search as string)?.toLowerCase().trim();

    const summary = await marketPriceService.getDailyRates(district, mandiId);

    let rates = summary.rates;
    if (search) {
      rates = rates.filter(
        (r) =>
          r.name.toLowerCase().includes(search) ||
          r.nameTamil.includes(search) ||
          r.category.toLowerCase().includes(search)
      );
    }

    res.json({
      success: true,
      availableMandis: MANDIS,
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
    const district = (req.query.district as string) || 'Salem';
    const ticker = await marketPriceService.getTickerRates(district);
    res.json({ success: true, ticker });
  } catch (error: any) {
    console.error('Error fetching ticker:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ticker' });
  }
});

/**
 * GET /api/market-prices/mandis
 * List all available Mandi markets
 */
router.get('/mandis', (req: Request, res: Response) => {
  res.json({ success: true, mandis: MANDIS });
});

export default router;
