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

  let clientId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  if (token && token !== 'guest' && token !== 'undefined' && token !== 'null') {
    try {
      const user = jwt.verify(token, ENV.JWT_SECRET) as AuthUser;
      if (user && user.id) {
        clientId = user.id;
      }
    } catch {
      // Continue as guest
    }
  }

  // Register client with RealtimeService
  RealtimeService.addClient(clientId, res);
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
