import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// Get User Notifications
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mark Single Notification as Read
router.patch('/:id/read', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    res.json(notification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mark All as Read
router.patch('/read-all', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id },
      data: { isRead: true },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
