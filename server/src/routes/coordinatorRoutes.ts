import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { FreshnessService } from '../services/freshnessService.js';

const router = Router();

router.use(authenticateToken);

// Get Village Farmers assisted by Coordinator
router.get('/farmers', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const farmers = await prisma.farmerProfile.findMany({
      include: {
        user: { select: { id: true, name: true, mobile: true, preferredLanguage: true } },
        batches: {
          where: { status: 'ACTIVE' },
          include: { product: true },
        },
      },
      orderBy: { joinedDate: 'desc' },
    });

    res.json(farmers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Assisted Farmer Registration (Coordinator registers a low-literacy farmer)
router.post('/register-farmer', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      mobile,
      village,
      district = 'Salem',
      landSize = 2.0,
      preferredLanguage = 'ta',
    } = req.body;

    if (!name || !mobile || !village) {
      res.status(400).json({ error: 'Name, mobile, and village are required' });
      return;
    }

    const email = `farmer_${mobile.slice(-4)}_${Date.now().toString().slice(-4)}@kisandirect.village`;
    const defaultPassword = 'Farmer@123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        passwordHash,
        role: 'FARMER',
        preferredLanguage,
      },
    });

    const farmerCount = await prisma.farmerProfile.count();
    const farmerId = `FD-${1000 + farmerCount + 1}`;

    const farmer = await prisma.farmerProfile.create({
      data: {
        userId: user.id,
        farmerId,
        village,
        district,
        state: 'Tamil Nadu',
        landSize: parseFloat(String(landSize)),
        rating: 4.8,
        completedOrders: 0,
        verified: true,
      },
      include: { user: true },
    });

    res.status(201).json({
      message: `Farmer ${name} registered successfully with ID ${farmerId}`,
      farmer,
      tempCredentials: { email, mobile, password: defaultPassword },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Assisted Produce Batch Creation (Voice or Coordinator assisted)
router.post('/create-batch', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      farmerProfileId,
      productId,
      quantity,
      pricePerKg,
      qualityGrade = 'A',
      harvestedAt,
      sellByHours = 12,
      notes,
    } = req.body;

    if (!farmerProfileId || !productId || !quantity || !pricePerKg) {
      res.status(400).json({ error: 'farmerProfileId, productId, quantity, and pricePerKg are required' });
      return;
    }

    const farmer = await prisma.farmerProfile.findUnique({
      where: { id: farmerProfileId },
      include: { user: true },
    });

    if (!farmer) {
      res.status(404).json({ error: 'Farmer not found' });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { freshnessRules: true },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const harvestDate = harvestedAt ? new Date(harvestedAt) : new Date();
    const sellByDate = new Date(Date.now() + parseFloat(String(sellByHours)) * 3600 * 1000);

    const freshness = FreshnessService.calculateFreshness(harvestDate, sellByDate, product.freshnessRules[0]);

    const shortCode = product.name.slice(0, 3).toUpperCase();
    const batchCount = await prisma.produceBatch.count();
    const batchCode = `${shortCode}-${new Date().getFullYear()}-${String(batchCount + 1).padStart(5, '0')}`;

    const batch = await prisma.produceBatch.create({
      data: {
        batchCode,
        farmerId: farmer.id,
        productId,
        quantity: parseFloat(quantity),
        initialQuantity: parseFloat(quantity),
        pricePerKg: parseFloat(pricePerKg),
        qualityGrade,
        harvestedAt: harvestDate,
        sellBy: sellByDate,
        freshnessStatus: freshness.status,
        status: 'ACTIVE',
        village: farmer.village,
        district: farmer.district,
        imageUrl: product.imageUrl,
        notes: notes || `Created by Village Coordinator on behalf of ${farmer.user.name}`,
      },
      include: { product: true, farmer: { include: { user: true } } },
    });

    res.status(201).json({
      message: `Batch ${batchCode} published on behalf of farmer ${farmer.user.name}`,
      batch,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Coordinator Overview
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalFarmers = await prisma.farmerProfile.count();
    const totalActiveBatches = await prisma.produceBatch.count({
      where: { status: 'ACTIVE' },
    });
    const recentDemands = await prisma.buyerDemand.findMany({
      where: { status: 'OPEN' },
      include: { product: true, buyer: { include: { user: true } } },
      take: 5,
    });

    res.json({
      totalFarmers,
      totalActiveBatches,
      recentDemands,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
