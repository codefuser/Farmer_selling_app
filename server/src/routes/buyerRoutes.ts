import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { MatchingService } from '../services/matchingService.js';
import { CollectiveSellingService } from '../services/collectiveSellingService.js';
import { FreshnessService } from '../services/freshnessService.js';

const router = Router();

router.use(authenticateToken);

async function getBuyerProfile(userId: string) {
  return await prisma.buyerProfile.findUnique({
    where: { userId },
    include: { user: true },
  });
}

// Buyer Dashboard Overview
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const buyer = await getBuyerProfile(req.user!.id);
    if (!buyer) {
      res.status(404).json({ error: 'Buyer profile not found' });
      return;
    }

    const demands = await prisma.buyerDemand.findMany({
      where: { buyerId: buyer.id },
      include: {
        product: true,
        offers: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const activeDemands = demands.filter((d) => d.status === 'OPEN' || d.status === 'MATCHED');

    const orders = await prisma.order.findMany({
      where: { buyerId: buyer.id },
      include: {
        items: { include: { batch: { include: { product: true } }, farmer: { include: { user: true } } } },
        deliveries: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const activeOrders = orders.filter((o) => !['COMPLETED', 'CANCELLED'].includes(o.status));

    res.json({
      buyer: {
        businessName: buyer.businessName,
        ownerName: buyer.ownerName,
        businessType: buyer.businessType,
        district: buyer.district,
        address: buyer.address,
      },
      stats: {
        activeDemandsCount: activeDemands.length,
        totalDemandsCount: demands.length,
        activeOrdersCount: activeOrders.length,
        totalOrdersCount: orders.length,
        totalSpent: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      },
      recentDemands: activeDemands.slice(0, 3),
      activeOrders: activeOrders.slice(0, 3),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Marketplace Produce Explorer
router.get('/marketplace', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId, maxPrice, grade, freshness, sortBy } = req.query;

    await FreshnessService.evaluateAllActiveBatches();

    const whereClause: any = {
      status: 'ACTIVE',
      quantity: { gt: 0 },
      freshnessStatus: { not: 'EXPIRED' },
    };

    if (productId) whereClause.productId = String(productId);
    if (grade && grade !== 'ALL') whereClause.qualityGrade = String(grade);
    if (freshness && freshness !== 'ALL') whereClause.freshnessStatus = String(freshness);
    if (maxPrice) whereClause.pricePerKg = { lte: parseFloat(String(maxPrice)) };

    const batches = await prisma.produceBatch.findMany({
      where: whereClause,
      include: {
        product: { include: { freshnessRules: true } },
        farmer: { include: { user: true } },
      },
      orderBy: sortBy === 'PRICE_ASC' ? { pricePerKg: 'asc' } : { createdAt: 'desc' },
    });

    const buyer = await getBuyerProfile(req.user!.id);
    const buyerLat = buyer?.latitude || 11.6643;
    const buyerLng = buyer?.longitude || 78.1460;

    const formatted = batches.map((batch) => {
      const distance = MatchingService.calculateDistance(
        buyerLat,
        buyerLng,
        batch.latitude,
        batch.longitude
      );
      const freshnessInfo = FreshnessService.calculateFreshness(
        batch.harvestedAt,
        batch.sellBy,
        batch.product.freshnessRules[0]
      );
      return {
        ...batch,
        distanceKm: distance,
        freshness: freshnessInfo,
      };
    });

    // Client-side sorting options
    if (sortBy === 'NEAREST') {
      formatted.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'FRESHEST') {
      formatted.sort((a, b) => b.freshness.percentRemaining - a.freshness.percentRemaining);
    } else if (sortBy === 'RATING') {
      formatted.sort((a, b) => b.farmer.rating - a.farmer.rating);
    }

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Buyer Demand
router.post('/demands', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const buyer = await getBuyerProfile(req.user!.id);
    if (!buyer) {
      res.status(404).json({ error: 'Buyer profile not found' });
      return;
    }

    const {
      productId,
      requiredQuantity,
      minBudget,
      maxBudget,
      requiredGrade = 'A',
      deliveryDeadline,
      location,
      maxDistanceKm = 25,
      notes,
    } = req.body;

    if (!productId || !requiredQuantity || !minBudget || !maxBudget) {
      res.status(400).json({ error: 'Product, required quantity, and budget range are required' });
      return;
    }

    const demandCount = await prisma.buyerDemand.count();
    const demandCode = `DEM-${new Date().getFullYear()}-${String(demandCount + 1).padStart(4, '0')}`;

    const demand = await prisma.buyerDemand.create({
      data: {
        demandCode,
        buyerId: buyer.id,
        productId,
        requiredQuantity: parseFloat(requiredQuantity),
        minBudget: parseFloat(minBudget),
        maxBudget: parseFloat(maxBudget),
        requiredGrade,
        deliveryDeadline: deliveryDeadline ? new Date(deliveryDeadline) : new Date(Date.now() + 24 * 3600 * 1000),
        location: location || buyer.address,
        district: buyer.district,
        latitude: buyer.latitude,
        longitude: buyer.longitude,
        maxDistanceKm: parseFloat(String(maxDistanceKm)),
        status: 'OPEN',
        notes,
      },
      include: { product: true },
    });

    res.status(201).json({
      message: 'Demand posted successfully',
      demand,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Demands
router.get('/demands', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const buyer = await getBuyerProfile(req.user!.id);
    if (!buyer) {
      res.status(404).json({ error: 'Buyer profile not found' });
      return;
    }

    const demands = await prisma.buyerDemand.findMany({
      where: { buyerId: buyer.id },
      include: {
        product: true,
        offers: { include: { farmer: { include: { user: true } }, batch: true } },
        collectiveOrders: { include: { members: { include: { farmer: { include: { user: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(demands);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Demand Details & Smart Matches
router.get('/demands/:id/matches', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const matchResults = await MatchingService.findMatchesForDemand(id);
    res.json(matchResults);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Send Offer to Farmer
router.post('/demands/:id/offers', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const buyer = await getBuyerProfile(req.user!.id);
    if (!buyer) {
      res.status(404).json({ error: 'Buyer profile not found' });
      return;
    }

    const { id: demandId } = req.params;
    const { batchId, farmerId, offeredPricePerKg, quantity, notes } = req.body;

    if (!batchId || !farmerId || !offeredPricePerKg || !quantity) {
      res.status(400).json({ error: 'Missing offer parameters' });
      return;
    }

    const offer = await prisma.offer.create({
      data: {
        demandId,
        batchId,
        buyerId: buyer.id,
        farmerId,
        offeredPricePerKg: parseFloat(offeredPricePerKg),
        quantity: parseFloat(quantity),
        status: 'PENDING',
        notes,
      },
    });

    // Record initial offer in history
    await prisma.offerHistory.create({
      data: {
        offerId: offer.id,
        proposedByUserId: req.user!.id,
        pricePerKg: parseFloat(offeredPricePerKg),
        notes: notes || `Buyer initiated offer of ₹${offeredPricePerKg}/kg for ${quantity} kg`,
      },
    });

    // Notify farmer
    const farmer = await prisma.farmerProfile.findUnique({
      where: { id: farmerId },
      include: { user: true },
    });

    if (farmer) {
      await prisma.notification.create({
        data: {
          userId: farmer.userId,
          title: 'New Offer Received!',
          message: `${buyer.businessName} has made an offer of ₹${offeredPricePerKg}/kg for ${quantity} kg.`,
          type: 'NEW_OFFER',
          metadataJson: JSON.stringify({ offerId: offer.id, demandId }),
        },
      });
    }

    res.status(201).json({ message: 'Offer sent successfully', offer });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Collective Order from Recommended Pool
router.post('/demands/:id/collective-order', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const buyer = await getBuyerProfile(req.user!.id);
    if (!buyer) {
      res.status(404).json({ error: 'Buyer profile not found' });
      return;
    }

    const { id: demandId } = req.params;
    const { agreedPricePerKg, deliveryAddress, allocations } = req.body;

    if (!agreedPricePerKg || !allocations || allocations.length === 0) {
      res.status(400).json({ error: 'Agreed price and farmer allocations required' });
      return;
    }

    const result = await CollectiveSellingService.createCollectiveOrder({
      demandId,
      buyerId: buyer.id,
      agreedPricePerKg: parseFloat(agreedPricePerKg),
      deliveryAddress: deliveryAddress || buyer.address,
      allocations,
    });

    res.status(201).json({
      message: 'Collective order successfully established and escrow payment authorized',
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Buyer Orders
router.get('/orders', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const buyer = await getBuyerProfile(req.user!.id);
    if (!buyer) {
      res.status(404).json({ error: 'Buyer profile not found' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { buyerId: buyer.id },
      include: {
        items: {
          include: {
            farmer: { include: { user: true } },
            batch: { include: { product: true } },
          },
        },
        deliveries: { include: { vehicle: true } },
        payments: true,
        qualityChecks: true,
        ratings: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CART & DIRECT CHECKOUT ENDPOINTS (Mode 1)
// ==========================================

// Get or Create Buyer Cart
router.get('/cart', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            batch: {
              include: {
                product: { include: { freshnessRules: true } },
                farmer: { include: { user: true } },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              batch: {
                include: {
                  product: { include: { freshnessRules: true } },
                  farmer: { include: { user: true } },
                },
              },
            },
          },
        },
      });
    }

    // Format items with live freshness calculations
    const items = cart.items.map((item) => {
      const freshness = FreshnessService.calculateFreshness(
        item.batch.harvestedAt,
        item.batch.sellBy,
        item.batch.product.freshnessRules[0]
      );
      return {
        id: item.id,
        batchId: item.batchId,
        quantity: item.quantity,
        batch: {
          ...item.batch,
          freshness,
        },
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.quantity * i.batch.pricePerKg, 0);
    const deliveryFee = items.length > 0 ? 40 : 0;
    const total = subtotal + deliveryFee;

    res.json({
      cartId: cart.id,
      items,
      itemCount: items.length,
      subtotal,
      deliveryFee,
      total,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add Item to Cart
router.post('/cart/items', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { batchId, quantity = 1 } = req.body;

    if (!batchId || quantity <= 0) {
      res.status(400).json({ error: 'Valid batchId and quantity are required' });
      return;
    }

    const batch = await prisma.produceBatch.findUnique({
      where: { id: batchId },
      include: { product: { include: { freshnessRules: true } } },
    });

    if (!batch || batch.status !== 'ACTIVE' || batch.quantity <= 0) {
      res.status(400).json({ error: 'This produce batch is currently unavailable or sold out' });
      return;
    }

    const freshness = FreshnessService.calculateFreshness(
      batch.harvestedAt,
      batch.sellBy,
      batch.product.freshnessRules[0]
    );

    if (freshness.status === 'EXPIRED') {
      res.status(400).json({ error: 'This batch has passed its shelf-life expiry' });
      return;
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const requestedQty = parseFloat(String(quantity));
    if (requestedQty > batch.quantity) {
      res.status(400).json({ error: `Requested quantity (${requestedQty} kg) exceeds available stock (${batch.quantity} kg)` });
      return;
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_batchId: {
          cartId: cart.id,
          batchId,
        },
      },
    });

    let cartItem;
    if (existingItem) {
      const newTotalQty = Math.min(batch.quantity, existingItem.quantity + requestedQty);
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newTotalQty },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          batchId,
          quantity: requestedQty,
        },
      });
    }

    res.status(201).json({ message: 'Item added to cart', cartItem });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Cart Item Quantity
router.patch('/cart/items/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const newQty = parseFloat(String(quantity));

    if (newQty <= 0) {
      await prisma.cartItem.delete({ where: { id } });
      res.json({ message: 'Item removed from cart' });
      return;
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { batch: true },
    });

    if (!cartItem) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    if (newQty > cartItem.batch.quantity) {
      res.status(400).json({ error: `Cannot exceed available stock of ${cartItem.batch.quantity} kg` });
      return;
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity: newQty },
    });

    res.json({ message: 'Cart item updated', cartItem: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Item from Cart
router.delete('/cart/items/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.cartItem.delete({ where: { id } });
    res.json({ message: 'Item removed from cart' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Clear Entire Cart
router.delete('/cart', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    res.json({ message: 'Cart cleared successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Direct Checkout (Mode 1: Single/Multi-Item Purchase)
router.post('/checkout', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const buyer = await getBuyerProfile(req.user!.id);
    if (!buyer) {
      res.status(404).json({ error: 'Buyer profile not found' });
      return;
    }

    const { items, deliveryAddress, paymentMethod = 'MOCK_UPI', notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'No items provided for checkout' });
      return;
    }

    // Execute safe transaction
    const orderResult = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      let totalQuantity = 0;
      const orderItemsToCreate: Array<{
        farmerId: string;
        batchId: string;
        quantity: number;
        pricePerKg: number;
        total: number;
      }> = [];

      for (const item of items) {
        const batch = await tx.produceBatch.findUnique({
          where: { id: item.batchId },
          include: { product: { include: { freshnessRules: true } }, farmer: true },
        });

        if (!batch) {
          throw new Error(`Produce batch ${item.batchId} not found`);
        }

        if (batch.status !== 'ACTIVE' || batch.quantity <= 0) {
          throw new Error(`Batch ${batch.batchCode} is sold out or inactive`);
        }

        const orderQty = parseFloat(String(item.quantity));
        if (orderQty > batch.quantity) {
          throw new Error(`Ordered quantity (${orderQty} kg) exceeds available stock (${batch.quantity} kg) for ${batch.batchCode}`);
        }

        const itemTotal = orderQty * batch.pricePerKg;
        totalAmount += itemTotal;
        totalQuantity += orderQty;

        orderItemsToCreate.push({
          farmerId: batch.farmerId,
          batchId: batch.id,
          quantity: orderQty,
          pricePerKg: batch.pricePerKg,
          total: itemTotal,
        });

        // Decrement batch quantity safely
        const remainingQty = batch.quantity - orderQty;
        await tx.produceBatch.update({
          where: { id: batch.id },
          data: {
            quantity: remainingQty,
            status: remainingQty === 0 ? 'SOLD_OUT' : 'ACTIVE',
          },
        });
      }

      // 2% platform fee, 98% farmer payout
      const platformFee = Math.round(totalAmount * 0.02 * 100) / 100;
      const farmerPayout = Math.round((totalAmount - platformFee) * 100) / 100;

      const orderCount = await tx.order.count();
      const orderCode = `ORD-${Date.now().toString().slice(-4)}${String(orderCount + 1).padStart(3, '0')}`;

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderCode,
          buyerId: buyer.id,
          totalQuantity,
          totalAmount,
          platformFee,
          farmerPayout,
          status: 'ORDERED',
          deliveryAddress: deliveryAddress || buyer.address,
          scheduledPickupTime: new Date(Date.now() + 2 * 3600 * 1000), // 2 hours from now
        },
      });

      // Create Order Items
      for (const orderItem of orderItemsToCreate) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            farmerId: orderItem.farmerId,
            batchId: orderItem.batchId,
            quantity: orderItem.quantity,
            pricePerKg: orderItem.pricePerKg,
            total: orderItem.total,
          },
        });
      }

      // Create Escrow Payment record
      const paymentCode = `PAY-${Date.now().toString().slice(-6)}`;
      await tx.payment.create({
        data: {
          paymentCode,
          orderId: newOrder.id,
          buyerId: buyer.id,
          amount: totalAmount,
          platformFee,
          status: 'AUTHORIZED', // Held in escrow until verified delivery
          paymentMethod,
          transactionRef: `TXN-${Date.now().toString().slice(-8)}`,
        },
      });

      // Create initial Delivery tracking record
      await tx.delivery.create({
        data: {
          orderId: newOrder.id,
          status: 'ASSIGNED',
          currentLat: buyer.latitude || 11.6643,
          currentLng: buyer.longitude || 78.1460,
          estimatedArrival: new Date(Date.now() + 4 * 3600 * 1000),
        },
      });

      return {
        order: newOrder,
        orderItemsToCreate,
        totalQuantity,
        totalAmount,
      };
    }, { maxWait: 10000, timeout: 25000 });

    const { order: newOrder, orderItemsToCreate, totalQuantity, totalAmount } = orderResult;

    // Asynchronously clear purchased items from cart and create notifications
    (async () => {
      try {
        const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
        if (cart) {
          const batchIds = items.map((i: any) => i.batchId);
          await prisma.cartItem.deleteMany({
            where: {
              cartId: cart.id,
              batchId: { in: batchIds },
            },
          });
        }

        // Notification for Buyer
        await prisma.notification.create({
          data: {
            userId: buyer.userId,
            title: `Order ${newOrder.orderCode} Placed!`,
            message: `Your order for ${totalQuantity} kg (₹${totalAmount}) has been placed. Payment is securely held in escrow.`,
            type: 'ORDER_CONFIRMED',
            metadataJson: JSON.stringify({ orderId: newOrder.id }),
          },
        });

        // Notifications for Farmers
        for (const orderItem of orderItemsToCreate) {
          const farmer = await prisma.farmerProfile.findUnique({
            where: { id: orderItem.farmerId },
          });
          if (farmer) {
            await prisma.notification.create({
              data: {
                userId: farmer.userId,
                title: 'New Direct Order Received!',
                message: `${buyer.businessName} purchased ${orderItem.quantity} kg of your produce for ₹${orderItem.total}.`,
                type: 'ORDER_CONFIRMED',
                metadataJson: JSON.stringify({ orderId: newOrder.id, quantity: orderItem.quantity }),
              },
            });
          }
        }
      } catch (postErr) {
        console.warn('Post-checkout background tasks warning:', postErr);
      }
    })();

    res.status(201).json({
      message: 'Checkout completed successfully! Order placed.',
      order: newOrder,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Checkout failed' });
  }
});

export default router;
