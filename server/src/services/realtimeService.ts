import { Response } from 'express';

interface SSEClient {
  userId: string;
  res: Response;
  connectedAt: Date;
}

export class RealtimeService {
  private static clients: Map<string, Set<Response>> = new Map();
  private static heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Start heartbeat ticker to keep SSE connections alive through reverse proxies
   */
  public static init() {
    if (!this.heartbeatInterval) {
      this.heartbeatInterval = setInterval(() => {
        this.broadcastComment('heartbeat');
      }, 20000);
      // Ensure the timer doesn't prevent Node process from exiting
      if (this.heartbeatInterval.unref) {
        this.heartbeatInterval.unref();
      }
    }
  }

  /**
   * Register a new SSE client for a user
   */
  public static addClient(userId: string, res: Response) {
    this.init();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering (Nginx, etc.)
    res.flushHeaders?.();

    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(res);

    // Send initial handshake
    this.sendToResponse(res, 'connected', {
      status: 'connected',
      userId,
      timestamp: new Date().toISOString(),
    });

    res.on('close', () => {
      this.removeClient(userId, res);
    });
  }

  /**
   * Remove a client upon disconnect
   */
  public static removeClient(userId: string, res: Response) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.delete(res);
      if (userClients.size === 0) {
        this.clients.delete(userId);
      }
    }
  }

  /**
   * Send an event to a specific user across all their open sessions
   */
  public static sendToUser(userId: string, event: string, data: any): boolean {
    const userClients = this.clients.get(userId);
    if (!userClients || userClients.size === 0) {
      return false;
    }

    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of userClients) {
      try {
        res.write(payload);
      } catch (err) {
        console.error(`Failed to send SSE to user ${userId}:`, err);
      }
    }
    return true;
  }

  /**
   * Broadcast an event to all connected users
   */
  public static broadcast(event: string, data: any) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const [userId, userClients] of this.clients.entries()) {
      for (const res of userClients) {
        try {
          res.write(payload);
        } catch (err) {
          console.error(`Failed to broadcast SSE to user ${userId}:`, err);
        }
      }
    }
  }

  /**
   * Send SSE comment for keep-alive
   */
  private static broadcastComment(comment: string) {
    const payload = `: ${comment}\n\n`;
    for (const userClients of this.clients.values()) {
      for (const res of userClients) {
        try {
          res.write(payload);
        } catch {
          // Handled on close
        }
      }
    }
  }

  private static sendToResponse(res: Response, event: string, data: any) {
    try {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      console.error('Error writing initial SSE event:', err);
    }
  }

  public static getConnectedCount(): number {
    let count = 0;
    for (const set of this.clients.values()) {
      count += set.size;
    }
    return count;
  }
}

export default RealtimeService;
