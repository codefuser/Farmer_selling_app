import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { RealtimeService } from '../services/realtimeService.js';
import { AuthUser } from '../middleware/auth.js';

const router = Router();

/**
 * SSE Stream Endpoint: /api/realtime/stream
 * Connects browser EventSource using token from query param or header
 */
router.get('/stream', (req: Request, res: Response): void => {
  const token = (req.query.token as string) || (req.headers['authorization']?.split(' ')[1]);

  if (!token) {
    res.status(401).json({ error: 'Authentication token required for realtime stream' });
    return;
  }

  let user: AuthUser;
  try {
    user = jwt.verify(token, ENV.JWT_SECRET) as AuthUser;
  } catch {
    res.status(403).json({ error: 'Invalid or expired stream token' });
    return;
  }

  // Register client with RealtimeService
  RealtimeService.addClient(user.id, res);
});

/**
 * Health/status for realtime connections
 */
router.get('/status', (req: Request, res: Response): void => {
  res.json({
    activeConnections: RealtimeService.getConnectedCount(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
