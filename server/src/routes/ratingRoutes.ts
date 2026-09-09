import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// Post Rating
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orderId, toUserId, score, comment } = req.body;

    if (!orderId || !toUserId || !score) {
      res.status(400).json({ error: 'orderId, toUserId, and score (1-5) are required' });
      return;
    }

    const rating = await prisma.rating.create({
      data: {
        orderId,
        fromUserId: req.user!.id,
        toUserId,
        score: parseInt(score),
        comment,
      },
    });

    // Recalculate average rating for farmer if target user is a farmer
    const farmerProfile = await prisma.farmerProfile.findUnique({
      where: { userId: toUserId },
    });

    if (farmerProfile) {
      const allRatings = await prisma.rating.findMany({
        where: { toUserId },
      });
      const avgScore = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;
      await prisma.farmerProfile.update({
        where: { id: farmerProfile.id },
        data: { rating: Math.round(avgScore * 10) / 10 },
      });
    }

    res.status(201).json({ message: 'Rating submitted successfully', rating });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Ratings
router.get('/:userId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const ratings = await prisma.rating.findMany({
      where: { toUserId: userId },
      include: { fromUser: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(ratings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
