import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken, optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { NotificationService } from '../services/notificationService.js';

const router = Router();

// ----------------------------------------------------------------------
// 1. GET /api/posts/feed - Paginated Social Commerce Feed
// ----------------------------------------------------------------------
router.get('/feed', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', category, cropName } = req.query;
    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const take = Math.min(50, Math.max(1, parseInt(String(limit)) || 10));
    const skip = (pageNum - 1) * take;

    const where: any = {
      status: 'ACTIVE',
      visibility: 'PUBLIC',
    };

    if (cropName) {
      where.cropName = { contains: String(cropName), mode: 'insensitive' };
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        farmer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                mobile: true,
              },
            },
          },
        },
        batch: {
          include: {
            product: true,
          },
        },
        media: {
          orderBy: { orderIndex: 'asc' },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    const currentUserId = req.user?.id;

    const formattedPosts = posts.map((post) => {
      const isLikedByMe = currentUserId ? post.likes.some((like) => like.userId === currentUserId) : false;
      return {
        id: post.id,
        farmerId: post.farmerId,
        farmer: {
          id: post.farmer.id,
          name: post.farmer.user.name,
          avatarUrl: post.farmer.user.avatarUrl,
          farmerId: post.farmer.farmerId,
          village: post.farmer.village,
          district: post.farmer.district,
          rating: post.farmer.rating,
          verified: post.farmer.verified,
          userId: post.farmer.user.id,
        },
        caption: post.caption,
        cropName: post.cropName || post.batch?.product?.nameTamil || post.batch?.product?.name,
        price: post.price ?? post.batch?.pricePerKg,
        quantity: post.quantity ?? post.batch?.quantity,
        unit: post.unit || 'kg',
        qualityGrade: post.qualityGrade || post.batch?.qualityGrade || 'A',
        harvestDate: post.harvestDate || post.batch?.harvestedAt,
        location: post.location,
        media: post.media.map((m) => ({
          id: m.id,
          url: m.mediaUrl,
          type: m.mediaType,
        })),
        batchId: post.batchId,
        batch: post.batch ? {
          id: post.batch.id,
          batchCode: post.batch.batchCode,
          freshnessStatus: post.batch.freshnessStatus,
          product: post.batch.product ? {
            name: post.batch.product.name,
            nameTamil: post.batch.product.nameTamil,
            imageUrl: post.batch.product.imageUrl,
          } : null,
        } : null,
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        isLikedByMe,
        createdAt: post.createdAt,
      };
    });

    const totalCount = await prisma.post.count({ where });

    res.json({
      posts: formattedPosts,
      page: pageNum,
      limit: take,
      totalCount,
      hasMore: skip + posts.length < totalCount,
    });
  } catch (err: any) {
    console.error('Feed error:', err);
    res.json({
      posts: [],
      page: 1,
      limit: 10,
      totalCount: 0,
      hasMore: false,
    });
  }
});

// ----------------------------------------------------------------------
// 2. POST /api/posts - Create Farmer Social Post
// ----------------------------------------------------------------------
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { caption, cropName, price, quantity, unit, qualityGrade, harvestDate, location, batchId, mediaUrls } = req.body;

    if (!caption || !caption.trim()) {
      res.status(400).json({ error: 'Post caption is required' });
      return;
    }

    // Get farmer profile for current user
    let farmer = await prisma.farmerProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!farmer) {
      const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
      if (user) {
        const farmerCount = await prisma.farmerProfile.count();
        farmer = await prisma.farmerProfile.create({
          data: {
            userId: user.id,
            farmerId: `FD-${1000 + farmerCount + 1}`,
            village: 'Thalaivasal',
            district: 'Salem',
            state: 'Tamil Nadu',
            farmingType: 'Conventional',
            rating: 4.8,
            verified: true,
          },
        });
      } else {
        res.status(403).json({ error: 'Only farmers can create marketplace posts. Please set up your farmer profile.' });
        return;
      }
    }

    const post = await prisma.post.create({
      data: {
        farmerId: farmer.id,
        batchId: batchId || null,
        caption: caption.trim(),
        cropName: cropName || null,
        price: price ? parseFloat(price) : null,
        quantity: quantity ? parseFloat(quantity) : null,
        unit: unit || 'kg',
        qualityGrade: qualityGrade || 'A',
        harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
        location: location || `${farmer.village}, ${farmer.district}`,
        status: 'ACTIVE',
        visibility: 'PUBLIC',
        media: {
          create: Array.isArray(mediaUrls)
            ? mediaUrls.map((url: string, index: number) => ({
                mediaUrl: url,
                mediaType: 'IMAGE',
                orderIndex: index,
              }))
            : [],
        },
      },
      include: {
        farmer: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        media: true,
        batch: { include: { product: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        ...post,
        likeCount: 0,
        commentCount: 0,
        isLikedByMe: false,
      },
    });
  } catch (err: any) {
    console.error('Create post error:', err);
    res.status(500).json({ error: err.message || 'Failed to create post' });
  }
});

// ----------------------------------------------------------------------
// 3. GET /api/posts/:id - Get Single Post Details
// ----------------------------------------------------------------------
router.get('/:id', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        farmer: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, mobile: true } },
          },
        },
        media: { orderBy: { orderIndex: 'asc' } },
        batch: { include: { product: true } },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!post || post.status === 'DELETED') {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json({
      id: post.id,
      farmerId: post.farmerId,
      farmer: {
        id: post.farmer.id,
        name: post.farmer.user.name,
        avatarUrl: post.farmer.user.avatarUrl,
        farmerId: post.farmer.farmerId,
        village: post.farmer.village,
        district: post.farmer.district,
        rating: post.farmer.rating,
        verified: post.farmer.verified,
        userId: post.farmer.user.id,
      },
      caption: post.caption,
      cropName: post.cropName,
      price: post.price,
      quantity: post.quantity,
      unit: post.unit,
      qualityGrade: post.qualityGrade,
      harvestDate: post.harvestDate,
      location: post.location,
      media: post.media.map((m) => ({ id: m.id, url: m.mediaUrl, type: m.mediaType })),
      batchId: post.batchId,
      batch: post.batch,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      isLikedByMe: req.user ? post.likes.some((l) => l.userId === req.user!.id) : false,
      createdAt: post.createdAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load post' });
  }
});

// ----------------------------------------------------------------------
// 4. DELETE /api/posts/:id - Delete Own Post
// ----------------------------------------------------------------------
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: { farmer: true },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (post.farmer.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'You are not authorized to delete this post' });
      return;
    }

    await prisma.post.delete({ where: { id } });
    res.json({ message: 'Post deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete post' });
  }
});

// ----------------------------------------------------------------------
// 5. POST /api/posts/:id/like - Like Post
// ----------------------------------------------------------------------
router.post('/:id/like', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const post = await prisma.post.findUnique({
      where: { id },
      include: { farmer: { include: { user: true } } },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Toggle: if exists, delete; if not, create
    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId,
        },
      },
    });

    let liked = false;

    if (existingLike) {
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });
      liked = false;
    } else {
      await prisma.postLike.create({
        data: {
          postId: id,
          userId,
        },
      });
      liked = true;

      // Dispatch notification to post author if liking another user's post
      if (post.farmer.userId !== userId) {
        await NotificationService.notify({
          userId: post.farmer.userId,
          title: 'New Like on your Harvest Post',
          message: `${req.user!.name} liked your post about ${post.cropName || 'fresh harvest'}.`,
          type: 'POST_LIKE',
          channel: 'IN_APP',
          metadata: { postId: id, likedByUserId: userId },
        });
      }
    }

    const likeCount = await prisma.postLike.count({ where: { postId: id } });

    res.json({
      message: liked ? 'Post liked' : 'Post unliked',
      liked,
      likeCount,
    });
  } catch (err: any) {
    console.error('Like error:', err);
    res.status(500).json({ error: err.message || 'Failed to toggle like' });
  }
});

// ----------------------------------------------------------------------
// 6. DELETE /api/posts/:id/like - Unlike Post
// ----------------------------------------------------------------------
router.delete('/:id/like', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await prisma.postLike.deleteMany({
      where: { postId: id, userId },
    });

    const likeCount = await prisma.postLike.count({ where: { postId: id } });

    res.json({
      message: 'Post unliked',
      liked: false,
      likeCount,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to unlike post' });
  }
});

// ----------------------------------------------------------------------
// 7. GET /api/posts/:id/comments - Load Comments & Replies
// ----------------------------------------------------------------------
router.get('/:id/comments', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const take = Math.min(50, Math.max(1, parseInt(String(limit)) || 20));
    const skip = (pageNum - 1) * take;

    const comments = await prisma.postComment.findMany({
      where: { postId: id },
      orderBy: { createdAt: 'asc' },
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
          },
        },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
        },
      },
    });

    const totalCount = await prisma.postComment.count({ where: { postId: id } });

    res.json({
      comments,
      totalCount,
      page: pageNum,
      hasMore: skip + comments.length < totalCount,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load comments' });
  }
});

// ----------------------------------------------------------------------
// 8. POST /api/posts/:id/comments - Add Comment
// ----------------------------------------------------------------------
router.post('/:id/comments', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Comment content cannot be empty' });
      return;
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: { farmer: { include: { user: true } } },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const comment = await prisma.postComment.create({
      data: {
        postId: id,
        userId,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
          },
        },
        replies: true,
      },
    });

    // Notify author if commenting on another user's post
    if (post.farmer.userId !== userId) {
      await NotificationService.notify({
        userId: post.farmer.userId,
        title: 'New Comment on your Harvest Post',
        message: `${req.user!.name} commented: "${content.substring(0, 60)}"`,
        type: 'POST_COMMENT',
        channel: 'IN_APP',
        metadata: { postId: id, commentId: comment.id, commentedByUserId: userId },
      });
    }

    res.status(201).json({
      message: 'Comment added successfully',
      comment,
    });
  } catch (err: any) {
    console.error('Comment error:', err);
    res.status(500).json({ error: err.message || 'Failed to add comment' });
  }
});

// ----------------------------------------------------------------------
// 9. DELETE /api/posts/comments/:commentId - Delete Own Comment
// ----------------------------------------------------------------------
router.delete('/comments/:commentId', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const comment = await prisma.postComment.findUnique({ where: { id: commentId } });

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'You are not authorized to delete this comment' });
      return;
    }

    await prisma.postComment.delete({ where: { id: commentId } });
    res.json({ message: 'Comment deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete comment' });
  }
});

// ----------------------------------------------------------------------
// 10. POST /api/posts/comments/:commentId/reply - Reply to Comment
// ----------------------------------------------------------------------
router.post('/comments/:commentId/reply', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    if (!content || !content.trim()) {
      res.status(400).json({ error: 'Reply content cannot be empty' });
      return;
    }

    const parentComment = await prisma.postComment.findUnique({
      where: { id: commentId },
      include: { user: true },
    });

    if (!parentComment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    const reply = await prisma.postCommentReply.create({
      data: {
        commentId,
        userId,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    // Notify original commenter if someone else replied
    if (parentComment.userId !== userId) {
      await NotificationService.notify({
        userId: parentComment.userId,
        title: 'New Reply to your comment',
        message: `${req.user!.name} replied: "${content.substring(0, 60)}"`,
        type: 'COMMENT_REPLY',
        channel: 'IN_APP',
        metadata: { commentId, replyId: reply.id, repliedByUserId: userId },
      });
    }

    res.status(201).json({
      message: 'Reply added successfully',
      reply,
    });
  } catch (err: any) {
    console.error('Reply error:', err);
    res.status(500).json({ error: err.message || 'Failed to add reply' });
  }
});

// ----------------------------------------------------------------------
// 11. DELETE /api/posts/comments/replies/:replyId - Delete Own Reply
// ----------------------------------------------------------------------
router.delete('/comments/replies/:replyId', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { replyId } = req.params;
    const reply = await prisma.postCommentReply.findUnique({ where: { id: replyId } });

    if (!reply) {
      res.status(404).json({ error: 'Reply not found' });
      return;
    }

    if (reply.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'You are not authorized to delete this reply' });
      return;
    }

    await prisma.postCommentReply.delete({ where: { id: replyId } });
    res.json({ message: 'Reply deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete reply' });
  }
});

export default router;
