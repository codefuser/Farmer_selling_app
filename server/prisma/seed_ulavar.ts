import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  },
});

async function main() {
  console.log('🌾 ====================================================');
  console.log('🌱 Starting Ulavar2Ulagam Official Database Seeder');
  console.log('🌾 "From Farmers to Your Family, Directly."');
  console.log('🌾 ====================================================');

  // 1. Clean existing records in relational order
  console.log('🧹 Cleaning existing test data...');
  try {
    await prisma.deliveryAssignment.deleteMany();
    await prisma.inventoryTransaction.deleteMany();
    await prisma.procurementTransaction.deleteMany();
    await prisma.farmerProduceSubmission.deleteMany();
    await prisma.orderCancellation.deleteMany();
    await prisma.rating.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.farmerPayout.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.delivery.deleteMany();
    await prisma.pickupRequest.deleteMany();
    await prisma.qualityCheck.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.collectiveOrderMember.deleteMany();
    await prisma.collectiveOrder.deleteMany();
    await prisma.offerHistory.deleteMany();
    await prisma.offer.deleteMany();
    await prisma.buyerDemand.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.produceBatch.deleteMany();
    await prisma.freshnessRule.deleteMany();
    await prisma.marketPrice.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.postCommentReply.deleteMany();
    await prisma.postComment.deleteMany();
    await prisma.postLike.deleteMany();
    await prisma.postMedia.deleteMany();
    await prisma.post.deleteMany();
    await prisma.messageRead.deleteMany();
    await prisma.messageAttachment.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversationMember.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.collectionCenter.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.coordinatorProfile.deleteMany();
    await prisma.buyerProfile.deleteMany();
    await prisma.farmerProfile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.product.deleteMany();
  } catch (err: any) {
    console.log('Initial cleanup note:', err.message);
  }

  const demoPassword = await bcrypt.hash('Demo@123', 10);

  // 2. Core Users (Supporting both @ulavar2ulagam.demo and @kisandirect.demo)
  console.log('👥 Creating Demo Accounts...');

  // Admin
  const adminUser = await prisma.user.create({
    data: {
      name: 'Lakshmi Narayanan (Operations Lead)',
      email: 'admin@ulavar2ulagam.demo',
      mobile: '9876543210',
      passwordHash: demoPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      activeRole: 'ADMIN',
    },
  });

  // Admin duplicate for legacy fallback
  await prisma.user.create({
    data: {
      name: 'Lakshmi Narayanan (Admin)',
      email: 'admin@kisandirect.demo',
      mobile: '9876543219',
      passwordHash: demoPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  // Farmer: Kumar Govindasamy
  const farmerUser = await prisma.user.create({
    data: {
      name: 'Kumar Govindasamy',
      email: 'farmer@ulavar2ulagam.demo',
      mobile: '9842112345',
      passwordHash: demoPassword,
      role: 'FARMER',
      activeRole: 'FARMER',
      status: 'ACTIVE',
      preferredLanguage: 'ta',
    },
  });
  const farmerProfile = await prisma.farmerProfile.create({
    data: {
      userId: farmerUser.id,
      farmerId: 'FD-1024',
      village: 'Thalaivasal',
      district: 'Salem',
      landSize: 4.5,
      farmingType: 'Organic & Natural',
      mainCrops: 'நாட்டு தக்காளி, சின்ன வெங்காயம், கத்தரிக்காய்',
      experienceYears: 12,
      bio: 'Third generation natural farmer in Thalaivasal growing native tomato varieties and small onions.',
      rating: 4.9,
      completedOrders: 58,
      verified: true,
      identityVerificationStatus: 'VERIFIED',
      farmVerificationStatus: 'VERIFIED',
    },
  });

  // Legacy farmer email
  const legacyFarmer = await prisma.user.create({
    data: {
      name: 'Kumar Govindasamy',
      email: 'farmer@kisandirect.demo',
      mobile: '9842112349',
      passwordHash: demoPassword,
      role: 'FARMER',
      status: 'ACTIVE',
    },
  });
  await prisma.farmerProfile.create({
    data: {
      userId: legacyFarmer.id,
      farmerId: 'FD-1025',
      village: 'Thalaivasal',
      district: 'Salem',
      landSize: 4.5,
      rating: 4.8,
      verified: true,
    },
  });

  // Customer: Priya Sundaram
  const customerUser = await prisma.user.create({
    data: {
      name: 'Priya Sundaram (Family Shopper)',
      email: 'customer@ulavar2ulagam.demo',
      mobile: '9843223456',
      passwordHash: demoPassword,
      role: 'BUYER',
      activeRole: 'BUYER',
      status: 'ACTIVE',
    },
  });
  const customerProfile = await prisma.buyerProfile.create({
    data: {
      userId: customerUser.id,
      businessName: 'Sundaram Residence',
      ownerName: 'Priya Sundaram',
      businessType: 'INDIVIDUAL',
      consumerType: 'INDIVIDUAL',
      address: 'Plot 42, Fairlands Cross Road, Salem',
      district: 'Salem',
      latitude: 11.6643,
      longitude: 78.1460,
      verified: true,
    },
  });

  // Legacy buyer email
  const legacyBuyer = await prisma.user.create({
    data: {
      name: 'Ramesh Sundaram (ABC Hotel)',
      email: 'buyer@kisandirect.demo',
      mobile: '9843223459',
      passwordHash: demoPassword,
      role: 'BUYER',
      status: 'ACTIVE',
    },
  });
  await prisma.buyerProfile.create({
    data: {
      userId: legacyBuyer.id,
      businessName: 'ABC Grand Heritage Hotel',
      ownerName: 'Ramesh Sundaram',
      businessType: 'HOTEL',
      address: 'Omalur Main Road, Fairlands, Salem',
      district: 'Salem',
      verified: true,
    },
  });

  // Delivery Partner: Karthik Murugan
  const deliveryUser = await prisma.user.create({
    data: {
      name: 'Karthik Murugan (Fleet Associate)',
      email: 'delivery@ulavar2ulagam.demo',
      mobile: '9841445678',
      passwordHash: demoPassword,
      role: 'LOGISTICS',
      activeRole: 'LOGISTICS',
      status: 'ACTIVE',
    },
  });

  // Legacy delivery email
  await prisma.user.create({
    data: {
      name: 'Ravi Kumar (Fleet)',
      email: 'logistics@kisandirect.demo',
      mobile: '9841445679',
      passwordHash: demoPassword,
      role: 'LOGISTICS',
      status: 'ACTIVE',
    },
  });

  // Vehicle for delivery
  const deliveryVehicle = await prisma.vehicle.create({
    data: {
      vehicleNumber: 'TN-30-AZ-4521',
      vehicleType: 'EV Delivery Van',
      driverName: 'Karthik Murugan',
      driverMobile: '9841445678',
      capacityKg: 800,
      status: 'AVAILABLE',
    },
  });

  // 3. Central Inventory Products (Covering all 6 categories)
  console.log('🛒 Seeding Central Inventory Products across 6 categories...');

  const inventoryProducts = [
    // VEGETABLES
    {
      name: 'Country Tomato',
      nameTamil: 'நாட்டு தக்காளி',
      category: 'VEGETABLES',
      unit: 'kg',
      stockQuantity: 140,
      lowStockThreshold: 30,
      sellingPrice: 28,
      avgProcurementCost: 20,
      referenceMinPrice: 22,
      referenceMaxPrice: 30,
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      description: 'Naturally ripened Salem country tomatoes with rich sour tang, perfect for authentic sambar and rasam.',
      status: 'IN_STOCK',
    },
    {
      name: 'Small Onion / Shallots',
      nameTamil: 'சின்ன வெங்காயம்',
      category: 'VEGETABLES',
      unit: 'kg',
      stockQuantity: 95,
      lowStockThreshold: 25,
      sellingPrice: 55,
      avgProcurementCost: 42,
      referenceMinPrice: 48,
      referenceMaxPrice: 62,
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
      description: 'Fresh aromatic sambar onions harvested from Perambalur and Salem farm clusters.',
      status: 'IN_STOCK',
    },
    {
      name: 'Purple Brinjal',
      nameTamil: 'கத்தரிக்காய்',
      category: 'VEGETABLES',
      unit: 'kg',
      stockQuantity: 65,
      lowStockThreshold: 20,
      sellingPrice: 34,
      avgProcurementCost: 24,
      referenceMinPrice: 28,
      referenceMaxPrice: 38,
      imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
      description: 'Glossy, tender local purple eggplants free from harmful chemical sprays.',
      status: 'IN_STOCK',
    },
    {
      name: 'Fresh Drumstick',
      nameTamil: 'முருங்கைக்காய்',
      category: 'VEGETABLES',
      unit: 'kg',
      stockQuantity: 50,
      lowStockThreshold: 15,
      sellingPrice: 62,
      avgProcurementCost: 45,
      referenceMinPrice: 50,
      referenceMaxPrice: 70,
      imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
      description: 'Long, fleshy drumsticks from Aravakurichi farms with tender seeds and high nutrition.',
      status: 'IN_STOCK',
    },

    // GREENS
    {
      name: 'Siru Keerai',
      nameTamil: 'சிறுகீரை',
      category: 'GREENS',
      unit: 'bunch',
      stockQuantity: 45,
      lowStockThreshold: 15,
      sellingPrice: 20,
      avgProcurementCost: 14,
      referenceMinPrice: 15,
      referenceMaxPrice: 22,
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      description: 'Early morning harvested fresh green siru keerai bunches, washed and bundled cleanly.',
      status: 'IN_STOCK',
    },
    {
      name: 'Arai Keerai',
      nameTamil: 'அரைக்கீரை',
      category: 'GREENS',
      unit: 'bunch',
      stockQuantity: 40,
      lowStockThreshold: 15,
      sellingPrice: 20,
      avgProcurementCost: 14,
      referenceMinPrice: 15,
      referenceMaxPrice: 22,
      imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
      description: 'Iron-rich traditional arai keerai bunches, harvested at peak freshness.',
      status: 'IN_STOCK',
    },

    // FRUITS
    {
      name: 'Salem Malgova Mango',
      nameTamil: 'சேலம் மாம்பழம்',
      category: 'FRUITS',
      unit: 'kg',
      stockQuantity: 60,
      lowStockThreshold: 20,
      sellingPrice: 130,
      avgProcurementCost: 95,
      referenceMinPrice: 110,
      referenceMaxPrice: 150,
      imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
      description: 'Naturally carbide-free tree-ripened Salem Malgova mangoes with succulent pulp and sweet aroma.',
      status: 'IN_STOCK',
    },
    {
      name: 'Yelakki Banana',
      nameTamil: 'ஏலக்கி வாழைப்பழம்',
      category: 'FRUITS',
      unit: 'kg',
      stockQuantity: 70,
      lowStockThreshold: 20,
      sellingPrice: 58,
      avgProcurementCost: 42,
      referenceMinPrice: 50,
      referenceMaxPrice: 65,
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
      description: 'Sweet baby bananas with thin golden skin, sourced directly from Mohanur river banks.',
      status: 'IN_STOCK',
    },

    // GRAINS
    {
      name: 'Ponni Raw Rice (Old Crop)',
      nameTamil: 'பொன்னி அரிசி',
      category: 'GRAINS',
      unit: 'kg',
      stockQuantity: 250,
      lowStockThreshold: 50,
      sellingPrice: 58,
      avgProcurementCost: 46,
      referenceMinPrice: 52,
      referenceMaxPrice: 64,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      description: '1-year aged premium Cauvery basin Ponni raw rice. Fluffy texture and non-sticky cooking.',
      status: 'IN_STOCK',
    },
    {
      name: 'BPT Sona Masoori Rice',
      nameTamil: 'சோனா மசூரி அரிசி',
      category: 'GRAINS',
      unit: 'kg',
      stockQuantity: 180,
      lowStockThreshold: 40,
      sellingPrice: 62,
      avgProcurementCost: 49,
      referenceMinPrice: 55,
      referenceMaxPrice: 68,
      imageUrl: 'https://images.unsplash.com/photo-1568651347477-941c43aa41bf?auto=format&fit=crop&w=600&q=80',
      description: 'Lightweight aromatic table rice, unpolished and naturally processed.',
      status: 'IN_STOCK',
    },

    // PULSES
    {
      name: 'First Grade Toor Dal',
      nameTamil: 'துவரம் பருப்பு',
      category: 'PULSES',
      unit: 'kg',
      stockQuantity: 85,
      lowStockThreshold: 25,
      sellingPrice: 145,
      avgProcurementCost: 118,
      referenceMinPrice: 135,
      referenceMaxPrice: 155,
      imageUrl: 'https://images.unsplash.com/photo-1585994192701-f1a505c817ea?auto=format&fit=crop&w=600&q=80',
      description: 'Unpolished protein-rich toor dal that melts smoothly for aromatic South Indian sambar.',
      status: 'IN_STOCK',
    },
    {
      name: 'Organic Moong Dal',
      nameTamil: 'பாசிப் பருப்பு',
      category: 'PULSES',
      unit: 'kg',
      stockQuantity: 65,
      lowStockThreshold: 20,
      sellingPrice: 125,
      avgProcurementCost: 98,
      referenceMinPrice: 115,
      referenceMaxPrice: 135,
      imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
      description: 'Natural yellow split moong dal, easy to digest and free from chemical polish.',
      status: 'IN_STOCK',
    },

    // SEASONAL PRODUCE
    {
      name: 'Tender Coconut',
      nameTamil: 'செவ்விளநீர்',
      category: 'SEASONAL',
      unit: 'piece',
      stockQuantity: 75,
      lowStockThreshold: 20,
      sellingPrice: 45,
      avgProcurementCost: 32,
      referenceMinPrice: 38,
      referenceMaxPrice: 50,
      imageUrl: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=600&q=80',
      description: 'Sweet, electrolyte-packed Pollachi red tender coconuts containing 400ml+ pure water.',
      status: 'IN_STOCK',
    },
  ];

  const productMap: Record<string, any> = {};
  for (const item of inventoryProducts) {
    const p = await prisma.product.create({
      data: {
        name: item.name,
        nameTamil: item.nameTamil,
        category: item.category,
        unit: item.unit,
        stockQuantity: item.stockQuantity,
        reservedQuantity: 0,
        lowStockThreshold: item.lowStockThreshold,
        sellingPrice: item.sellingPrice,
        avgProcurementCost: item.avgProcurementCost,
        referenceMinPrice: item.referenceMinPrice,
        referenceMaxPrice: item.referenceMaxPrice,
        imageUrl: item.imageUrl,
        description: item.description,
        status: item.status,
        isPublished: true,
      },
    });
    productMap[item.name] = p;

    // Create market price reference
    await prisma.marketPrice.create({
      data: {
        productId: p.id,
        district: 'Salem',
        date: new Date().toISOString().split('T')[0],
        minPrice: item.referenceMinPrice,
        modalPrice: Math.round((item.referenceMinPrice + item.referenceMaxPrice) / 2),
        maxPrice: item.referenceMaxPrice,
      },
    });

    // Create produce batch for backward compatibility
    const batch = await prisma.produceBatch.create({
      data: {
        batchCode: `BATCH-${item.name.slice(0, 3).toUpperCase()}-001`,
        farmerId: farmerProfile.id,
        productId: p.id,
        quantity: item.stockQuantity,
        initialQuantity: item.stockQuantity,
        pricePerKg: item.sellingPrice,
        qualityGrade: 'A',
        harvestedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        sellBy: new Date(Date.now() + 1000 * 60 * 60 * 48),
        village: 'Thalaivasal',
        district: 'Salem',
        status: 'ACTIVE',
      },
    });
    productMap[`${item.name}_batch`] = batch;
  }

  // 4. Farmer Produce Submissions (The core Farmer workflow)
  console.log('📝 Seeding Farmer Produce Submissions...');

  const sub1 = await prisma.farmerProduceSubmission.create({
    data: {
      submissionCode: 'SUB-2026-101',
      farmerId: farmerProfile.id,
      produceName: 'Country Tomato',
      category: 'VEGETABLES',
      quantity: 150,
      unit: 'kg',
      expectedPrice: 22,
      harvestDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
      farmLocation: 'Survey No. 142, Thalaivasal East',
      district: 'Salem',
      description: 'First grade round country tomatoes harvested yesterday morning. 150 kg packed in crates.',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      status: 'PURCHASED',
      adminNotes: 'Quality verified Grade A. Procured 140kg for central inventory distribution.',
    },
  });

  const sub2 = await prisma.farmerProduceSubmission.create({
    data: {
      submissionCode: 'SUB-2026-102',
      farmerId: farmerProfile.id,
      produceName: 'Small Onion / Shallots',
      category: 'VEGETABLES',
      quantity: 100,
      unit: 'kg',
      expectedPrice: 42,
      harvestDate: new Date(Date.now() - 1000 * 60 * 60 * 36),
      farmLocation: 'Survey No. 145, Thalaivasal',
      district: 'Salem',
      description: 'Properly dried small onions, zero moisture, high shelf life.',
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
      status: 'PURCHASED',
      adminNotes: 'Procured 95kg at ₹42/kg. Transferred to Central Hub.',
    },
  });

  const sub3 = await prisma.farmerProduceSubmission.create({
    data: {
      submissionCode: 'SUB-2026-103',
      farmerId: farmerProfile.id,
      produceName: 'Siru Keerai',
      category: 'GREENS',
      quantity: 50,
      unit: 'bunch',
      expectedPrice: 14,
      harvestDate: new Date(),
      farmLocation: 'Survey No. 142, Thalaivasal',
      district: 'Salem',
      description: 'Fresh early morning harvested greens, 50 bunches ready for pickup.',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      status: 'APPROVED',
      adminNotes: 'Approved for procurement. Logistics scheduled for pickup.',
    },
  });

  const sub4 = await prisma.farmerProduceSubmission.create({
    data: {
      submissionCode: 'SUB-2026-104',
      farmerId: farmerProfile.id,
      produceName: 'Salem Malgova Mango',
      category: 'FRUITS',
      quantity: 80,
      unit: 'kg',
      expectedPrice: 95,
      harvestDate: new Date(Date.now() + 1000 * 60 * 60 * 12),
      farmLocation: 'Mettur Road Orchard, Thalaivasal',
      district: 'Salem',
      description: 'Sweet Malgova variety scheduled for harvest tomorrow morning.',
      imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
      status: 'UNDER_REVIEW',
      adminNotes: 'Field team scheduled for quality check.',
    },
  });

  const sub5 = await prisma.farmerProduceSubmission.create({
    data: {
      submissionCode: 'SUB-2026-105',
      farmerId: farmerProfile.id,
      produceName: 'First Grade Toor Dal',
      category: 'PULSES',
      quantity: 120,
      unit: 'kg',
      expectedPrice: 115,
      harvestDate: new Date(Date.now() - 1000 * 60 * 60 * 72),
      farmLocation: 'East Farm Yard, Thalaivasal',
      district: 'Salem',
      description: 'Sun-dried unpolished toor dal grains, cleanly winnowed.',
      imageUrl: 'https://images.unsplash.com/photo-1585994192701-f1a505c817ea?auto=format&fit=crop&w=600&q=80',
      status: 'SUBMITTED',
      adminNotes: 'Newly submitted by farmer.',
    },
  });

  // 5. Procurement Transactions (The core Company Procurement workflow)
  console.log('🤝 Seeding Procurement Transactions...');

  const proc1 = await prisma.procurementTransaction.create({
    data: {
      transactionCode: 'PROC-2026-001',
      submissionId: sub1.id,
      farmerId: farmerProfile.id,
      productId: productMap['Country Tomato'].id,
      purchasedQuantity: 140,
      unit: 'kg',
      purchasePricePerUnit: 20,
      totalCost: 2800,
      procuredBy: adminUser.id,
      qualityGrade: 'A',
      notes: 'Direct farmgate procurement. 140 kg loaded into Central Warehouse A.',
    },
  });

  const proc2 = await prisma.procurementTransaction.create({
    data: {
      transactionCode: 'PROC-2026-002',
      submissionId: sub2.id,
      farmerId: farmerProfile.id,
      productId: productMap['Small Onion / Shallots'].id,
      purchasedQuantity: 95,
      unit: 'kg',
      purchasePricePerUnit: 42,
      totalCost: 3990,
      procuredBy: adminUser.id,
      qualityGrade: 'A',
      notes: 'Procured 95 kg shallots at agreed price. Direct bank payout authorized.',
    },
  });

  // Inventory Transactions for procurement
  await prisma.inventoryTransaction.create({
    data: {
      productId: productMap['Country Tomato'].id,
      type: 'PROCUREMENT_INFLOW',
      quantity: 140,
      balanceAfter: 140,
      referenceCode: proc1.transactionCode,
      notes: 'Initial procurement intake from Farmer Kumar',
    },
  });

  await prisma.inventoryTransaction.create({
    data: {
      productId: productMap['Small Onion / Shallots'].id,
      type: 'PROCUREMENT_INFLOW',
      quantity: 95,
      balanceAfter: 95,
      referenceCode: proc2.transactionCode,
      notes: 'Initial procurement intake from Farmer Kumar',
    },
  });

  // 6. Customer Orders & Delivery Workflow
  console.log('📦 Seeding Customer Orders & Delivery Assignments...');

  // Order 1: Out for Delivery
  const order1 = await prisma.order.create({
    data: {
      orderCode: 'ORD-2026-101',
      buyerId: customerProfile.id,
      totalQuantity: 7,
      subtotal: 204,
      deliveryFee: 30,
      totalAmount: 234,
      platformFee: 0,
      farmerPayout: 180,
      status: 'OUT_FOR_DELIVERY',
      paymentMethod: 'DEMO_UPI',
      paymentStatus: 'PAID',
      customerName: 'Priya Sundaram',
      customerPhone: '9843223456',
      deliveryAddress: 'Plot 42, Fairlands Cross Road, Salem',
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      farmerId: farmerProfile.id,
      batchId: productMap['Country Tomato_batch'].id,
      productId: productMap['Country Tomato'].id,
      productName: 'Country Tomato',
      unit: 'kg',
      quantity: 5,
      pricePerKg: 28,
      total: 140,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      farmerId: farmerProfile.id,
      batchId: productMap['Siru Keerai_batch'].id,
      productId: productMap['Siru Keerai'].id,
      productName: 'Siru Keerai',
      unit: 'bunch',
      quantity: 2,
      pricePerKg: 20,
      total: 40,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      farmerId: farmerProfile.id,
      batchId: productMap['Small Onion / Shallots_batch'].id,
      productId: productMap['Small Onion / Shallots'].id,
      productName: 'Small Onion / Shallots',
      unit: 'kg',
      quantity: 1,
      pricePerKg: 55,
      total: 55,
    },
  });

  // Assign delivery to Karthik Murugan
  await prisma.deliveryAssignment.create({
    data: {
      orderId: order1.id,
      driverId: deliveryUser.id,
      status: 'OUT_FOR_DELIVERY',
      pickupTime: new Date(Date.now() - 1000 * 60 * 45),
      confirmationOtp: '4821',
      notes: 'Dispatched from Salem Central Hub. Driver en route to Fairlands.',
    },
  });

  // Order 2: Packed and ready for dispatch
  const order2 = await prisma.order.create({
    data: {
      orderCode: 'ORD-2026-102',
      buyerId: customerProfile.id,
      totalQuantity: 12,
      subtotal: 870,
      deliveryFee: 0, // Free delivery above 500
      totalAmount: 870,
      platformFee: 0,
      farmerPayout: 720,
      status: 'PACKED',
      paymentMethod: 'DEMO_CARD',
      paymentStatus: 'PAID',
      customerName: 'Priya Sundaram',
      customerPhone: '9843223456',
      deliveryAddress: 'Plot 42, Fairlands Cross Road, Salem',
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      farmerId: farmerProfile.id,
      batchId: productMap['Ponni Raw Rice (Old Crop)_batch'].id,
      productId: productMap['Ponni Raw Rice (Old Crop)'].id,
      productName: 'Ponni Raw Rice (Old Crop)',
      unit: 'kg',
      quantity: 10,
      pricePerKg: 58,
      total: 580,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      farmerId: farmerProfile.id,
      batchId: productMap['First Grade Toor Dal_batch'].id,
      productId: productMap['First Grade Toor Dal'].id,
      productName: 'First Grade Toor Dal',
      unit: 'kg',
      quantity: 2,
      pricePerKg: 145,
      total: 290,
    },
  });

  // Order 3: Completed / Delivered
  const order3 = await prisma.order.create({
    data: {
      orderCode: 'ORD-2026-103',
      buyerId: customerProfile.id,
      totalQuantity: 5,
      subtotal: 480,
      deliveryFee: 30,
      totalAmount: 510,
      platformFee: 0,
      farmerPayout: 380,
      status: 'DELIVERED',
      deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PAID',
      customerName: 'Priya Sundaram',
      customerPhone: '9843223456',
      deliveryAddress: 'Plot 42, Fairlands Cross Road, Salem',
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order3.id,
      farmerId: farmerProfile.id,
      batchId: productMap['Salem Malgova Mango_batch'].id,
      productId: productMap['Salem Malgova Mango'].id,
      productName: 'Salem Malgova Mango',
      unit: 'kg',
      quantity: 3,
      pricePerKg: 130,
      total: 390,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order3.id,
      farmerId: farmerProfile.id,
      batchId: productMap['Tender Coconut_batch'].id,
      productId: productMap['Tender Coconut'].id,
      productName: 'Tender Coconut',
      unit: 'piece',
      quantity: 2,
      pricePerKg: 45,
      total: 90,
    },
  });

  await prisma.deliveryAssignment.create({
    data: {
      orderId: order3.id,
      driverId: deliveryUser.id,
      status: 'DELIVERED',
      pickupTime: new Date(Date.now() - 1000 * 60 * 60 * 6),
      deliveredTime: new Date(Date.now() - 1000 * 60 * 60 * 5),
      confirmationOtp: '9152',
      notes: 'Delivered directly to Priya Sundaram. Cash collected ₹510.',
    },
  });

  // Add 5-star rating for order 3
  await prisma.rating.create({
    data: {
      orderId: order3.id,
      fromUserId: customerUser.id,
      toUserId: adminUser.id,
      score: 5,
      qualityScore: 5,
      freshnessScore: 5,
      accuracyScore: 5,
      communicationScore: 5,
      comment: 'Super fresh mangoes and sweet tender coconuts! Delivered in under 3 hours directly from Ulavar2Ulagam.',
    },
  });

  console.log('🌾 ====================================================');
  console.log('✅ Ulavar2Ulagam Database Seed Complete!');
  console.log('🌾 ====================================================');
  console.log('Demo Personas (Password: Demo@123):');
  console.log('👑 Admin:            admin@ulavar2ulagam.demo (or admin@kisandirect.demo)');
  console.log('🌾 Farmer Partner:   farmer@ulavar2ulagam.demo (or farmer@kisandirect.demo) - Kumar');
  console.log('🛒 Customer:         customer@ulavar2ulagam.demo (or buyer@kisandirect.demo) - Priya');
  console.log('🚚 Delivery Partner: delivery@ulavar2ulagam.demo (or logistics@kisandirect.demo) - Karthik');
  console.log('🌾 ====================================================');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
