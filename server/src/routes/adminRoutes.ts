import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { RealtimeService } from '../services/realtimeService.js';

const router = Router();

router.use(authenticateToken);

// Admin Dashboard Overview
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalFarmers = await prisma.farmerProfile.count();
    const totalBuyers = await prisma.buyerProfile.count();
    const totalCoordinators = await prisma.coordinatorProfile.count();
    const activeBatches = await prisma.produceBatch.count({ where: { status: 'ACTIVE' } });
    const urgentBatches = await prisma.produceBatch.count({ where: { freshnessStatus: 'URGENT' } });
    const activeDemands = await prisma.buyerDemand.count({ where: { status: 'OPEN' } });
    const totalOrders = await prisma.order.count();
    const completedOrders = await prisma.order.count({ where: { status: 'COMPLETED' } });
    const openDisputes = await prisma.dispute.count({ where: { status: 'OPEN' } });

    const orders = await prisma.order.findMany({
      select: { totalAmount: true, platformFee: true, farmerPayout: true },
    });

    const totalGrossVolume = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const platformRevenue = orders.reduce((sum, o) => sum + o.platformFee, 0);
    const totalFarmerPayout = orders.reduce((sum, o) => sum + o.farmerPayout, 0);

    // Impact Calculations (Prototype Demo Metrics)
    const estimatedWastagePreventedKg = Math.round(activeBatches * 85 + completedOrders * 320);
    const estimatedIntermediaryMarginSaved = Math.round(totalGrossVolume * 0.18); // 18% savings vs middlemen

    res.json({
      counts: {
        totalFarmers,
        totalBuyers,
        totalCoordinators,
        activeBatches,
        urgentBatches,
        activeDemands,
        totalOrders,
        completedOrders,
        openDisputes,
      },
      financials: {
        totalGrossVolume,
        platformRevenue,
        totalFarmerPayout,
      },
      impact: {
        estimatedWastagePreventedKg,
        estimatedIntermediaryMarginSaved,
        collectiveSellingPoolsCount: await prisma.collectiveOrder.count(),
        averageFarmerPriceAdvantagePercent: 22.4, // +22.4% higher net earnings
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Farmers list
router.get('/farmers', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const farmers = await prisma.farmerProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, mobile: true, status: true, createdAt: true } },
        batches: true,
      },
      orderBy: { joinedDate: 'desc' },
    });
    res.json(farmers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Buyers list
router.get('/buyers', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const buyers = await prisma.buyerProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, mobile: true, status: true, createdAt: true } },
        demands: true,
        orders: true,
      },
    });
    res.json(buyers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Batches list
router.get('/listings', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const batches = await prisma.produceBatch.findMany({
      include: {
        product: true,
        farmer: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(batches);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Orders list
router.get('/orders', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        buyer: { include: { user: true } },
        items: { include: { farmer: { include: { user: true } }, batch: { include: { product: true } } } },
        payments: true,
        qualityChecks: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Disputes list
router.get('/disputes', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const disputes = await prisma.dispute.findMany({
      include: {
        order: { include: { buyer: true } },
        raisedByUser: { select: { name: true, role: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(disputes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Resolve Dispute
router.patch('/disputes/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;

    const dispute = await prisma.dispute.update({
      where: { id },
      data: {
        status: status || 'RESOLVED',
        resolutionNotes,
      },
    });

    res.json({ message: 'Dispute status updated', dispute });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Suspend / Activate User
router.patch('/users/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { status },
    });

    res.json({ message: `User status changed to ${status}`, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ULAVAR2ULAGAM COMPLETE ADMIN OPERATIONS
// ==========================================

// 1. Live Database Metrics
router.get('/metrics', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalFarmers = await prisma.farmerProfile.count();
    const pendingSubmissions = await prisma.farmerProduceSubmission.count({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
    });
    const approvedSubmissions = await prisma.farmerProduceSubmission.count({
      where: { status: 'APPROVED' },
    });
    const completedProcurements = await prisma.procurementTransaction.count();

    const procurements = await prisma.procurementTransaction.findMany({
      select: { totalCost: true, purchasedQuantity: true },
    });
    const totalProcurementSpend = procurements.reduce((sum, p) => sum + p.totalCost, 0);

    const availableInventoryItems = await prisma.product.count({
      where: { stockQuantity: { gt: 0 } },
    });

    const products = await prisma.product.findMany({
      select: { stockQuantity: true, lowStockThreshold: true },
    });
    const lowStockProducts = products.filter(
      (p) => p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0
    ).length;

    const totalCustomerOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({
      where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } },
    });
    const completedOrders = await prisma.order.count({
      where: { status: 'DELIVERED' },
    });

    const deliveredOrders = await prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { totalAmount: true },
    });
    const totalSalesRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const grossMargin = totalSalesRevenue - totalProcurementSpend;

    res.json({
      totalFarmers,
      pendingSubmissions,
      approvedSubmissions,
      completedProcurements,
      totalProcurementSpend,
      availableInventoryItems,
      lowStockProducts,
      totalCustomerOrders,
      pendingOrders,
      completedOrders,
      totalSalesRevenue,
      grossMargin,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Farmer Produce Submissions Management
router.get('/submissions', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, category } = req.query;
    const where: any = {};
    if (status && status !== 'ALL') where.status = String(status);
    if (category && category !== 'ALL') where.category = String(category);

    const submissions = await prisma.farmerProduceSubmission.findMany({
      where,
      include: {
        farmer: {
          include: {
            user: { select: { id: true, name: true, mobile: true, email: true } },
          },
        },
        procurement: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(submissions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Review Submission (Approve / Reject / Under Review)
router.put('/submissions/:id/review', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminNotes, rejectionReason } = req.body;

    if (!['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUBMITTED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status for submission review' });
      return;
    }

    const updated = await prisma.farmerProduceSubmission.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || null,
        rejectionReason: rejectionReason || null,
      },
      include: {
        farmer: { include: { user: true } },
      },
    });

    res.json({ message: `Submission updated to ${status}`, submission: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Procurement Management: Execute Procurement & Add to Central Inventory
router.post('/procurements', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      submissionId,
      purchasedQuantity,
      purchasePricePerUnit,
      sellingPrice,
      qualityGrade = 'A',
      notes,
    } = req.body;

    if (!submissionId || !purchasedQuantity || !purchasePricePerUnit) {
      res.status(400).json({ error: 'submissionId, purchasedQuantity, and purchasePricePerUnit are required.' });
      return;
    }

    const qty = parseFloat(String(purchasedQuantity));
    const unitPrice = parseFloat(String(purchasePricePerUnit));
    if (isNaN(qty) || qty <= 0 || isNaN(unitPrice) || unitPrice <= 0) {
      res.status(400).json({ error: 'Quantities and prices must be positive numbers.' });
      return;
    }

    const totalCost = Math.round(qty * unitPrice * 100) / 100;
    const transactionCode = `PROC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await prisma.$transaction(async (tx) => {
      const submission = await tx.farmerProduceSubmission.findUnique({
        where: { id: submissionId },
        include: { farmer: true },
      });

      if (!submission) {
        throw new Error('Farmer produce submission not found.');
      }

      if (submission.status === 'PURCHASED') {
        throw new Error('This submission has already been procured.');
      }

      // Check if product exists in Central Inventory or create one
      let product = await tx.product.findFirst({
        where: { name: submission.produceName },
      });

      const retailPrice = sellingPrice ? parseFloat(String(sellingPrice)) : (product ? product.sellingPrice : Math.round(unitPrice * 1.35));

      if (product) {
        const newStock = product.stockQuantity + qty;
        product = await tx.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: newStock,
            status: 'IN_STOCK',
            sellingPrice: retailPrice,
            avgProcurementCost: unitPrice,
          },
        });
      } else {
        product = await tx.product.create({
          data: {
            name: submission.produceName,
            nameTamil: submission.produceName,
            category: submission.category,
            unit: submission.unit || 'kg',
            stockQuantity: qty,
            lowStockThreshold: 20,
            sellingPrice: retailPrice,
            avgProcurementCost: unitPrice,
            referenceMinPrice: unitPrice,
            referenceMaxPrice: retailPrice,
            imageUrl: submission.imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
            description: submission.description,
            status: 'IN_STOCK',
            isPublished: true,
          },
        });
      }

      // Record Procurement Transaction
      const procurement = await tx.procurementTransaction.create({
        data: {
          transactionCode,
          submissionId: submission.id,
          farmerId: submission.farmerId,
          productId: product.id,
          purchasedQuantity: qty,
          unit: submission.unit || 'kg',
          purchasePricePerUnit: unitPrice,
          totalCost,
          procuredBy: req.user!.id,
          qualityGrade,
          notes: notes || `Direct procurement from farmer ${submission.farmer.farmerId}`,
        },
      });

      // Update submission status to PURCHASED
      await tx.farmerProduceSubmission.update({
        where: { id: submission.id },
        data: { status: 'PURCHASED' },
      });

      // Record Central Inventory Inflow Movement
      await tx.inventoryTransaction.create({
        data: {
          productId: product.id,
          type: 'PROCUREMENT_INFLOW',
          quantity: qty,
          balanceAfter: product.stockQuantity,
          referenceCode: transactionCode,
          notes: `Procured from Farmer (${submission.produceName})`,
        },
      });

      return { procurement, product };
    });

    // Realtime notification of newly procured or updated inventory
    RealtimeService.broadcast('inventory_update', {
      productId: result.product.id,
      product: result.product,
      action: 'procured',
    });
    RealtimeService.broadcast('product_updated', result.product);

    res.status(201).json({
      message: 'Procurement recorded successfully and Central Inventory updated!',
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Procurement History
router.get('/procurements', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const procurements = await prisma.procurementTransaction.findMany({
      include: {
        submission: true,
        farmer: { include: { user: { select: { name: true, mobile: true, email: true } } } },
        product: true,
      },
      orderBy: { procurementDate: 'desc' },
    });
    res.json(procurements);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Central Inventory Management
router.get('/inventory', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: {
        inventoryTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Inventory Product details (pricing, low-stock threshold, published status)
router.put('/inventory/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { sellingPrice, lowStockThreshold, isPublished, description, category } = req.body;

    const data: any = {};
    if (sellingPrice !== undefined) data.sellingPrice = parseFloat(String(sellingPrice));
    if (lowStockThreshold !== undefined) data.lowStockThreshold = parseFloat(String(lowStockThreshold));
    if (isPublished !== undefined) data.isPublished = Boolean(isPublished);
    if (description !== undefined) data.description = description;
    if (category !== undefined) data.category = category;

    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    RealtimeService.broadcast('inventory_update', {
      productId: updated.id,
      product: updated,
      action: 'updated',
    });
    RealtimeService.broadcast('product_updated', updated);

    res.json({ message: 'Product updated successfully', product: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Direct Add Product to Central Inventory
router.post('/inventory/product', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      nameTamil,
      category,
      unit = 'kg',
      stockQuantity = 0,
      sellingPrice,
      lowStockThreshold = 20,
      avgProcurementCost,
      imageUrl,
      description,
    } = req.body;

    if (!name || !category || sellingPrice === undefined) {
      res.status(400).json({ error: 'name, category, and sellingPrice are required.' });
      return;
    }

    const price = parseFloat(String(sellingPrice));
    const stock = parseFloat(String(stockQuantity));
    const cost = avgProcurementCost !== undefined ? parseFloat(String(avgProcurementCost)) : Math.round(price * 0.7);

    const product = await prisma.product.create({
      data: {
        name,
        nameTamil: nameTamil || name,
        category: String(category).toUpperCase(),
        unit: unit || 'kg',
        stockQuantity: stock,
        sellingPrice: price,
        lowStockThreshold: parseFloat(String(lowStockThreshold)),
        avgProcurementCost: cost,
        referenceMinPrice: cost,
        referenceMaxPrice: price,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600',
        description: description || '',
        status: stock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
        isPublished: true,
      },
    });

    // Add baseline market price
    await prisma.marketPrice.create({
      data: {
        productId: product.id,
        district: 'Salem',
        date: new Date().toISOString().split('T')[0],
        minPrice: cost,
        modalPrice: Math.round((cost + price) / 2),
        maxPrice: price,
      },
    });

    RealtimeService.broadcast('product_added', product);
    RealtimeService.broadcast('inventory_update', {
      productId: product.id,
      product,
      action: 'added',
    });

    res.status(201).json({ message: 'Product listed successfully in inventory!', product });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Product from Inventory
router.delete('/inventory/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });

    RealtimeService.broadcast('product_deleted', { productId: id });
    RealtimeService.broadcast('inventory_update', { productId: id, action: 'deleted' });

    res.json({ message: 'Product deleted from inventory.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Manual Stock Adjustment / Damage Write-Off
router.post('/inventory/adjust', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId, adjustmentQuantity, type = 'ADJUSTMENT', notes } = req.body;

    if (!productId || adjustmentQuantity === undefined) {
      res.status(400).json({ error: 'productId and adjustmentQuantity are required.' });
      return;
    }

    const changeQty = parseFloat(String(adjustmentQuantity));

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found.');

      const newBalance = Math.max(0, product.stockQuantity + changeQty);
      const newStatus = newBalance === 0 ? 'OUT_OF_STOCK' : newBalance <= product.lowStockThreshold ? 'LOW_STOCK' : 'IN_STOCK';

      const updated = await tx.product.update({
        where: { id: productId },
        data: {
          stockQuantity: newBalance,
          status: newStatus,
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          productId: product.id,
          type: type || 'ADJUSTMENT',
          quantity: changeQty,
          balanceAfter: newBalance,
          referenceCode: `ADJ-${Date.now().toString().slice(-6)}`,
          notes: notes || 'Admin manual stock balance adjustment',
        },
      });

      return updated;
    });

    RealtimeService.broadcast('inventory_update', {
      productId: result.id,
      product: result,
      action: 'adjusted',
    });
    RealtimeService.broadcast('product_updated', result);

    res.json({ message: 'Stock adjusted successfully', product: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Customer Order Management
router.get('/customer-orders', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status && status !== 'ALL') where.status = String(status);

    const orders = await prisma.order.findMany({
      where,
      include: {
        buyer: { include: { user: true } },
        items: { include: { product: true } },
        deliveryAssignment: { include: { driver: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Advance Order Status along lifecycle
router.put('/orders/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'PACKED',
      'READY_FOR_DISPATCH',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid order status. Allowed: ${validStatuses.join(', ')}` });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) throw new Error('Order not found.');

      // If cancelling, restore central inventory
      if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
        for (const item of order.items) {
          if (item.productId) {
            const product = await tx.product.findUnique({ where: { id: item.productId } });
            if (product) {
              const restoredQty = product.stockQuantity + item.quantity;
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  stockQuantity: restoredQty,
                  status: restoredQty > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
                },
              });
              await tx.inventoryTransaction.create({
                data: {
                  productId: item.productId,
                  type: 'ORDER_RESTORE',
                  quantity: item.quantity,
                  balanceAfter: restoredQty,
                  referenceCode: order.orderCode,
                  notes: `Restored stock from cancelled order ${order.orderCode}`,
                },
              });
            }
          }
        }
      }

      const updateData: any = { status };
      if (status === 'DELIVERED') {
        updateData.deliveredAt = new Date();
      }
      if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = notes || 'Cancelled by administration';
      }

      const updated = await tx.order.update({
        where: { id },
        data: updateData,
        include: {
          buyer: { include: { user: true } },
          items: { include: { product: true } },
          deliveryAssignment: { include: { driver: true } },
        },
      });

      return updated;
    });

    res.json({ message: `Order status updated to ${status}`, order: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Assign Delivery Driver to Order
router.post('/orders/:id/assign-delivery', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { driverId, notes } = req.body;

    if (!driverId) {
      res.status(400).json({ error: 'driverId is required to assign delivery.' });
      return;
    }

    const driver = await prisma.user.findUnique({ where: { id: driverId } });
    if (!driver) {
      res.status(404).json({ error: 'Delivery driver user not found.' });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Upsert delivery assignment
    const assignment = await prisma.deliveryAssignment.upsert({
      where: { orderId: id },
      update: {
        driverId,
        status: 'ASSIGNED',
        confirmationOtp: otp,
        notes: notes || `Assigned to ${driver.name}`,
      },
      create: {
        orderId: id,
        driverId,
        status: 'ASSIGNED',
        confirmationOtp: otp,
        notes: notes || `Assigned to ${driver.name}`,
      },
      include: { driver: true },
    });

    // Update order status to READY_FOR_DISPATCH
    await prisma.order.update({
      where: { id },
      data: { status: 'READY_FOR_DISPATCH' },
    });

    res.json({
      message: `Delivery driver ${driver.name} assigned successfully!`,
      assignment,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get available Delivery Partners
router.get('/delivery-partners', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const partners = await prisma.user.findMany({
      where: {
        role: { in: ['LOGISTICS', 'DELIVERY_PARTNER'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        status: true,
      },
    });
    res.json(partners);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Operational & Financial Reports
router.get('/reports', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const procurements = await prisma.procurementTransaction.findMany({
      include: { product: true, farmer: { include: { user: true } } },
    });

    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } } },
    });

    const products = await prisma.product.findMany();

    const categoryBreakdown: Record<string, { inventoryStock: number; procurementSpend: number; salesTotal: number }> = {};
    for (const p of products) {
      if (!categoryBreakdown[p.category]) {
        categoryBreakdown[p.category] = { inventoryStock: 0, procurementSpend: 0, salesTotal: 0 };
      }
      categoryBreakdown[p.category].inventoryStock += p.stockQuantity;
    }

    for (const proc of procurements) {
      const cat = proc.product?.category || 'OTHER';
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { inventoryStock: 0, procurementSpend: 0, salesTotal: 0 };
      }
      categoryBreakdown[cat].procurementSpend += proc.totalCost;
    }

    for (const ord of orders) {
      if (ord.status !== 'CANCELLED') {
        for (const itm of ord.items) {
          const cat = itm.product?.category || 'OTHER';
          if (!categoryBreakdown[cat]) {
            categoryBreakdown[cat] = { inventoryStock: 0, procurementSpend: 0, salesTotal: 0 };
          }
          categoryBreakdown[cat].salesTotal += itm.total;
        }
      }
    }

    res.json({
      categoryBreakdown,
      procurementsCount: procurements.length,
      ordersCount: orders.length,
      inventoryValuation: products.reduce((sum, p) => sum + p.stockQuantity * p.sellingPrice, 0),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
