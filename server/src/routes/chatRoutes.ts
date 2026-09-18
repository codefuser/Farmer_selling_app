import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { NotificationService } from '../services/notificationService.js';

const router = Router();

router.use(authenticateToken);

// ----------------------------------------------------------------------
// 1. POST /api/chat/conversations - Get or Create 1-on-1 Conversation
// ----------------------------------------------------------------------
router.post('/conversations', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user!.id;

    if (!targetUserId) {
      res.status(400).json({ error: 'Target user ID is required' });
      return;
    }

    if (targetUserId === currentUserId) {
      res.status(400).json({ error: 'Cannot start conversation with yourself' });
      return;
    }

    // Check if a conversation between these two already exists
    const existingMembership = await prisma.conversationMember.findMany({
      where: {
        userId: { in: [currentUserId, targetUserId] },
      },
      select: { conversationId: true, userId: true },
    });

    const conversationIds = existingMembership.map((m) => m.conversationId);
    // Find conversation ID that has both user IDs
    const matchedConvId = conversationIds.find(
      (id) =>
        existingMembership.filter((m) => m.conversationId === id && m.userId === currentUserId).length > 0 &&
        existingMembership.filter((m) => m.conversationId === id && m.userId === targetUserId).length > 0
    );

    if (matchedConvId) {
      const existingConv = await prisma.conversation.findUnique({
        where: { id: matchedConvId },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, avatarUrl: true, role: true },
              },
            },
          },
        },
      });

      res.json({ conversation: existingConv });
      return;
    }

    // Create new conversation with both members
    const newConv = await prisma.conversation.create({
      data: {
        members: {
          create: [
            { userId: currentUserId, lastReadAt: new Date() },
            { userId: targetUserId, lastReadAt: new Date() },
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true, role: true },
            },
          },
        },
      },
    });

    res.status(201).json({ conversation: newConv });
  } catch (err: any) {
    console.error('Conversation create error:', err);
    res.status(500).json({ error: err.message || 'Failed to start conversation' });
  }
});

// ----------------------------------------------------------------------
// 2. GET /api/chat/conversations - List User Conversations
// ----------------------------------------------------------------------
router.get('/conversations', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user!.id;

    // Get all conversations this user belongs to
    const memberships = await prisma.conversationMember.findMany({
      where: { userId: currentUserId },
      include: {
        conversation: {
          include: {
            members: {
              include: {
                user: {
                  select: { id: true, name: true, avatarUrl: true, role: true },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: 'desc' } },
    });

    const conversationList = await Promise.all(
      memberships.map(async (m) => {
        const conv = m.conversation;
        const otherMember = conv.members.find((member) => member.userId !== currentUserId);
        const lastMessage = conv.messages[0] || null;

        // Count unread messages sent after user's lastReadAt
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: currentUserId },
            createdAt: { gt: m.lastReadAt },
          },
        });

        return {
          id: conv.id,
          recipient: otherMember?.user || { id: 'unknown', name: 'User', role: 'BUYER' },
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                isMine: lastMessage.senderId === currentUserId,
              }
            : null,
          unreadCount,
          updatedAt: conv.updatedAt,
        };
      })
    );

    res.json({ conversations: conversationList });
  } catch (err: any) {
    console.error('Conversations list error:', err);
    res.json({ conversations: [] });
  }
});

// ----------------------------------------------------------------------
// 3. GET /api/chat/conversations/:id/messages - Get Message History
// ----------------------------------------------------------------------
router.get('/conversations/:id/messages', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUserId = req.user!.id;
    const { page = '1', limit = '30' } = req.query;

    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const take = Math.min(100, Math.max(1, parseInt(String(limit)) || 30));
    const skip = (pageNum - 1) * take;

    // Check membership
    const isMember = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId: id,
          userId: currentUserId,
        },
      },
    });

    if (!isMember) {
      res.status(403).json({ error: 'Not authorized to view this conversation' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
        attachments: true,
      },
    });

    const totalCount = await prisma.message.count({ where: { conversationId: id } });

    // Mark as read immediately
    await prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId: id,
          userId: currentUserId,
        },
      },
      data: { lastReadAt: new Date() },
    });

    res.json({
      messages: messages.reverse(), // chronologically ascending for UI
      totalCount,
      page: pageNum,
      hasMore: skip + messages.length < totalCount,
    });
  } catch (err: any) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch messages' });
  }
});

// ----------------------------------------------------------------------
// 4. POST /api/chat/conversations/:id/messages - Send Message
// ----------------------------------------------------------------------
router.post('/conversations/:id/messages', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content, attachments } = req.body;
    const currentUserId = req.user!.id;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Message content cannot be empty' });
      return;
    }

    // Verify membership
    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId: id,
          userId: currentUserId,
        },
      },
    });

    if (!membership) {
      res.status(403).json({ error: 'You are not a member of this conversation' });
      return;
    }

    // Create message with optional attachments
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: currentUserId,
        content: content.trim(),
        attachments: {
          create: Array.isArray(attachments)
            ? attachments.map((att: any) => ({
                fileUrl: att.fileUrl,
                fileType: att.fileType || 'IMAGE',
                fileName: att.fileName || null,
              }))
            : [],
        },
      },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
        attachments: true,
      },
    });

    // Update conversation updatedAt timestamp & sender's lastReadAt
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    await prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId: id,
          userId: currentUserId,
        },
      },
      data: { lastReadAt: new Date() },
    });

    // Notify recipient member
    const otherMembers = await prisma.conversationMember.findMany({
      where: {
        conversationId: id,
        userId: { not: currentUserId },
      },
    });

    for (const member of otherMembers) {
      await NotificationService.notify({
        userId: member.userId,
        title: `Message from ${req.user!.name}`,
        message: content.length > 80 ? `${content.substring(0, 80)}...` : content,
        type: 'CHAT_MESSAGE',
        channel: 'IN_APP',
        metadata: { conversationId: id, messageId: message.id, senderId: currentUserId },
      });
    }

    res.status(201).json({ message });
  } catch (err: any) {
    console.error('Send message error:', err);
    res.status(500).json({ error: err.message || 'Failed to send message' });
  }
});

// ----------------------------------------------------------------------
// 5. PATCH /api/chat/conversations/:id/read - Mark Conversation Read
// ----------------------------------------------------------------------
router.patch('/conversations/:id/read', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUserId = req.user!.id;

    await prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId: id,
          userId: currentUserId,
        },
      },
      data: { lastReadAt: new Date() },
    });

    res.json({ success: true, message: 'Conversation marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to mark as read' });
  }
});

export default router;
