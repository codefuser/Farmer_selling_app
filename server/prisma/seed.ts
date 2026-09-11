import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('🌱 Starting comprehensive database seed for KisanDirect...');

  // Clear existing records in proper relational order
  await prisma.notification.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.rating.deleteMany();
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
  await prisma.collectionCenter.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.coordinatorProfile.deleteMany();
  await prisma.buyerProfile.deleteMany();
  await prisma.farmerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  const demoPassword = await bcrypt.hash('Demo@123', 10);

  // 1. PRODUCTS & FRESHNESS RULES & MARKET PRICES
  console.log('📦 Seeding Products & Freshness Rules...');
  const productsData = [
    {
      name: 'Tomato',
      nameTamil: 'தக்காளி',
      category: 'VEGETABLE',
      unit: 'kg',
      defaultShelfHours: 24,
      referenceMinPrice: 20,
      referenceMaxPrice: 25,
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      freshHours: 12,
      agingHours: 6,
      urgentHours: 4,
      urgentDiscount: 15,
      modalPrice: 23,
    },
    {
      name: 'Brinjal',
      nameTamil: 'கத்தரிக்காய்',
      category: 'VEGETABLE',
      unit: 'kg',
      defaultShelfHours: 36,
      referenceMinPrice: 25,
      referenceMaxPrice: 32,
      imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
      freshHours: 20,
      agingHours: 10,
      urgentHours: 6,
      urgentDiscount: 15,
      modalPrice: 28,
    },
    {
      name: 'Onion',
      nameTamil: 'வெங்காயம்',
      category: 'VEGETABLE',
      unit: 'kg',
      defaultShelfHours: 120,
      referenceMinPrice: 30,
      referenceMaxPrice: 38,
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
      freshHours: 72,
      agingHours: 36,
      urgentHours: 12,
      urgentDiscount: 10,
      modalPrice: 34,
    },
    {
      name: 'Potato',
      nameTamil: 'உருளைக்கிழங்கு',
      category: 'VEGETABLE',
      unit: 'kg',
      defaultShelfHours: 168,
      referenceMinPrice: 22,
      referenceMaxPrice: 28,
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
      freshHours: 96,
      agingHours: 48,
      urgentHours: 24,
      urgentDiscount: 10,
      modalPrice: 25,
    },
    {
      name: 'Banana',
      nameTamil: 'வாழைப்பழம்',
      category: 'FRUIT',
      unit: 'kg',
      defaultShelfHours: 48,
      referenceMinPrice: 35,
      referenceMaxPrice: 45,
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
      freshHours: 24,
      agingHours: 14,
      urgentHours: 8,
      urgentDiscount: 20,
      modalPrice: 40,
    },
    {
      name: 'Coconut',
      nameTamil: 'தேங்காய்',
      category: 'FRUIT',
      unit: 'piece',
      defaultShelfHours: 240,
      referenceMinPrice: 18,
      referenceMaxPrice: 25,
      imageUrl: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=600&q=80',
      freshHours: 140,
      agingHours: 60,
      urgentHours: 20,
      urgentDiscount: 10,
      modalPrice: 22,
    },
    {
      name: 'Leafy Greens',
      nameTamil: 'கீரை வகைகள்',
      category: 'VEGETABLE',
      unit: 'bunch',
      defaultShelfHours: 14,
      referenceMinPrice: 12,
      referenceMaxPrice: 18,
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      freshHours: 7,
      agingHours: 4,
      urgentHours: 3,
      urgentDiscount: 25,
      modalPrice: 15,
    },
  ];

  const createdProducts: Record<string, any> = {};
  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        nameTamil: p.nameTamil,
        category: p.category,
        unit: p.unit,
        defaultShelfHours: p.defaultShelfHours,
        referenceMinPrice: p.referenceMinPrice,
        referenceMaxPrice: p.referenceMaxPrice,
        imageUrl: p.imageUrl,
      },
    });

    await prisma.freshnessRule.create({
      data: {
        productId: product.id,
        freshDurationHours: p.freshHours,
        agingDurationHours: p.agingHours,
        urgentDurationHours: p.urgentHours,
        urgentDiscountPercent: p.urgentDiscount,
      },
    });

    await prisma.marketPrice.create({
      data: {
        productId: product.id,
        district: 'Salem',
        date: new Date().toISOString().split('T')[0],
        minPrice: p.referenceMinPrice,
        modalPrice: p.modalPrice,
        maxPrice: p.referenceMaxPrice,
      },
    });

    createdProducts[p.name] = product;
  }

  // 2. CORE DEMO USERS
  console.log('👤 Seeding Core Demo Accounts...');

  // Admin: Lakshmi
  const adminUser = await prisma.user.create({
    data: {
      name: 'Lakshmi Narayanan (Admin)',
      email: 'admin@kisandirect.demo',
      mobile: '9876543210',
      passwordHash: demoPassword,
      role: 'ADMIN',
    },
  });

  // Main Demo Farmer: Kumar (Salem, Grade A Tomatoes, Tamil/English)
  const farmerKumarUser = await prisma.user.create({
    data: {
      name: 'Kumar Govindasamy',
      email: 'farmer@kisandirect.demo',
      mobile: '9842112345',
      passwordHash: demoPassword,
      role: 'FARMER',
      preferredLanguage: 'ta',
    },
  });
  const farmerKumarProfile = await prisma.farmerProfile.create({
    data: {
      userId: farmerKumarUser.id,
      farmerId: 'FD-1024',
      village: 'Thalaivasal',
      district: 'Salem',
      landSize: 3.5,
      rating: 4.8,
      completedOrders: 42,
      verified: true,
    },
  });

  // Main Demo Buyer: ABC Hotel
  const buyerAbcUser = await prisma.user.create({
    data: {
      name: 'Ramesh Sundaram (ABC Hotel)',
      email: 'buyer@kisandirect.demo',
      mobile: '9843223456',
      passwordHash: demoPassword,
      role: 'BUYER',
    },
  });
  const buyerAbcProfile = await prisma.buyerProfile.create({
    data: {
      userId: buyerAbcUser.id,
      businessName: 'ABC Grand Heritage Hotel',
      ownerName: 'Ramesh Sundaram',
      businessType: 'HOTEL',
      gstNumber: '33AAAAA0000A1Z5',
      address: 'Omalur Main Road, Fairlands, Salem',
      district: 'Salem',
      latitude: 11.6643,
      longitude: 78.1460,
      verified: true,
    },
  });

  // Main Demo Coordinator: Selvam
  const coordSelvamUser = await prisma.user.create({
    data: {
      name: 'Selvam Murugesan',
      email: 'coordinator@kisandirect.demo',
      mobile: '9841334567',
      passwordHash: demoPassword,
      role: 'COORDINATOR',
    },
  });
  const coordSelvamProfile = await prisma.coordinatorProfile.create({
    data: {
      userId: coordSelvamUser.id,
      village: 'Thalaivasal',
      district: 'Salem',
      activeFarmersCount: 24,
      verified: true,
    },
  });

  // Main Demo Logistics: Ravi
  const logisticsRaviUser = await prisma.user.create({
    data: {
      name: 'Ravi Kumar (SpeedAgri Fleet)',
      email: 'logistics@kisandirect.demo',
      mobile: '9840445678',
      passwordHash: demoPassword,
      role: 'LOGISTICS',
    },
  });

  // Additional Coordinators (Total 3)
  for (let i = 2; i <= 3; i++) {
    const cUser = await prisma.user.create({
      data: {
        name: `Coordinator ${i} (${i === 2 ? 'Attur Hub' : 'Mecheri Hub'})`,
        email: `coordinator${i}@kisandirect.demo`,
        mobile: `984133456${i}`,
        passwordHash: demoPassword,
        role: 'COORDINATOR',
      },
    });
    await prisma.coordinatorProfile.create({
      data: {
        userId: cUser.id,
        village: i === 2 ? 'Attur' : 'Mecheri',
        district: 'Salem',
        activeFarmersCount: 18 + i,
        verified: true,
      },
    });
  }

  // Vehicles & Collection Centers
  const vehicle1 = await prisma.vehicle.create({
    data: {
      vehicleNumber: 'TN-30-BC-4491',
      vehicleType: 'Small Truck (1.5 Ton)',
      driverName: 'Ravi Kumar',
      driverMobile: '9840445678',
      capacityKg: 1500,
      status: 'AVAILABLE',
    },
  });
  const vehicle2 = await prisma.vehicle.create({
    data: {
      vehicleNumber: 'TN-30-EF-8812',
      vehicleType: 'Refrigerated Van (2.0 Ton)',
      driverName: 'Senthil Vel',
      driverMobile: '9840556789',
      capacityKg: 2000,
      status: 'AVAILABLE',
    },
  });

  const center1 = await prisma.collectionCenter.create({
    data: {
      centerCode: 'CC-SLM-01',
      name: 'Thalaivasal Agri Hub & Quality Center',
      village: 'Thalaivasal',
      district: 'Salem',
      coordinatorId: coordSelvamProfile.id,
      latitude: 11.5833,
      longitude: 78.5833,
    },
  });
  const center2 = await prisma.collectionCenter.create({
    data: {
      centerCode: 'CC-SLM-02',
      name: 'Attur Farmers Collection Depot',
      village: 'Attur',
      district: 'Salem',
      latitude: 11.5997,
      longitude: 78.6012,
    },
  });

  // 3. SEED 19 ADDITIONAL FARMERS (Total 20)
  console.log('🌾 Seeding 19 Additional Farmers...');
  const farmerNames = [
    { name: 'Murugan Palanisamy', village: 'Attur', dist: 8.2, land: 2.0, rating: 4.9 },
    { name: 'Priya Soundararajan', village: 'Gangavalli', dist: 12.1, land: 1.8, rating: 4.7 },
    { name: 'Ravi Chandran', village: 'Mecheri', dist: 9.8, land: 4.0, rating: 4.6 },
    { name: 'Chinnasamy Ramasamy', village: 'Omalur', dist: 14.5, land: 3.0, rating: 4.8 },
    { name: 'Anitha Manickam', village: 'Valapadi', dist: 7.5, land: 2.2, rating: 4.9 },
    { name: 'Karthik Subramani', village: 'Thalaivasal', dist: 5.0, land: 3.2, rating: 4.7 },
    { name: 'Dhanapal Perumal', village: 'Attur', dist: 8.5, land: 2.8, rating: 4.8 },
    { name: 'Kavitha Natarajan', village: 'Gangavalli', dist: 11.8, land: 1.5, rating: 4.6 },
    { name: 'Muthusamy Sengodan', village: 'Sankagiri', dist: 22.0, land: 5.0, rating: 4.8 },
    { name: 'Saravanan Rajagopal', village: 'Mecheri', dist: 10.2, land: 2.4, rating: 4.5 },
    { name: 'Balamurugan Velu', village: 'Valapadi', dist: 6.8, land: 3.1, rating: 4.9 },
    { name: 'Meenakshi Krishnan', village: 'Omalur', dist: 15.0, land: 2.0, rating: 4.7 },
    { name: 'Senthilnathan Durai', village: 'Thalaivasal', dist: 4.8, land: 4.2, rating: 4.8 },
    { name: 'Rukmani Appasamy', village: 'Attur', dist: 9.0, land: 1.9, rating: 4.7 },
    { name: 'Venkatesan Chelladurai', village: 'Gangavalli', dist: 13.0, land: 3.5, rating: 4.6 },
    { name: 'Gowri Shankar', village: 'Valapadi', dist: 7.2, land: 2.6, rating: 4.8 },
    { name: 'Palaniammal Kaliyaperumal', village: 'Sankagiri', dist: 23.5, land: 2.2, rating: 4.7 },
    { name: 'Thirunavukkarasu Muthu', village: 'Mecheri', dist: 10.5, land: 3.8, rating: 4.9 },
    { name: 'Vasantha Arumugam', village: 'Thalaivasal', dist: 5.4, land: 2.1, rating: 4.6 },
  ];

  const allFarmers: any[] = [farmerKumarProfile];

  for (let idx = 0; idx < farmerNames.length; idx++) {
    const f = farmerNames[idx];
    const u = await prisma.user.create({
      data: {
        name: f.name,
        email: `farmer${idx + 2}@kisandirect.demo`,
        mobile: `9842${String(idx + 100).padStart(6, '0')}`,
        passwordHash: demoPassword,
        role: 'FARMER',
        preferredLanguage: idx % 2 === 0 ? 'ta' : 'en',
      },
    });

    const prof = await prisma.farmerProfile.create({
      data: {
        userId: u.id,
        farmerId: `FD-${1025 + idx}`,
        village: f.village,
        district: 'Salem',
        landSize: f.land,
        rating: f.rating,
        completedOrders: Math.floor(Math.random() * 30) + 10,
        verified: true,
      },
    });
    allFarmers.push(prof);
  }

  // 4. SEED 9 ADDITIONAL BUYERS (Total 10)
  console.log('🏢 Seeding 9 Additional Buyers...');
  const buyerTypes = [
    { name: 'Green Valley Fresh Supermarket', type: 'SUPERMARKET', owner: 'Sridhar K', addr: 'Five Roads, Salem' },
    { name: 'Annapoorna Caterers & Events', type: 'CATERING', owner: 'Mani Iyer', addr: 'Shevapet, Salem' },
    { name: 'Salem Royal Spices & Veg Wholesale', type: 'WHOLESALER', owner: 'Jaganathan P', addr: 'Market Yard, Salem' },
    { name: 'Sri Krishna Sweets & Bakery', type: 'RESTAURANT', owner: 'Krishna Murthy', addr: 'Junction Road, Salem' },
    { name: 'Daily Organics Retail Mart', type: 'LOCAL_SHOP', owner: 'Rajeshwari S', addr: 'Hasthampatti, Salem' },
    { name: 'Highway Feast Resort & Kitchen', type: 'HOTEL', owner: 'Vinod Thomas', addr: 'NH 44, Salem Bypass' },
    { name: 'Elite Dining & Hospitality', type: 'RESTAURANT', owner: 'Faiz Ahmed', addr: 'Alagapuram, Salem' },
    { name: 'Salem Metro Fresh Produce Ltd', type: 'WHOLESALER', owner: 'Nandakumar V', addr: 'Suramangalam, Salem' },
    { name: 'Saravana Bhavan Grand', type: 'HOTEL', owner: 'Gopalakrishnan N', addr: 'New Bus Stand, Salem' },
  ];

  const allBuyers: any[] = [buyerAbcProfile];
  for (let idx = 0; idx < buyerTypes.length; idx++) {
    const b = buyerTypes[idx];
    const u = await prisma.user.create({
      data: {
        name: b.owner,
        email: `buyer${idx + 2}@kisandirect.demo`,
        mobile: `9843${String(idx + 100).padStart(6, '0')}`,
        passwordHash: demoPassword,
        role: 'BUYER',
      },
    });

    const prof = await prisma.buyerProfile.create({
      data: {
        userId: u.id,
        businessName: b.name,
        ownerName: b.owner,
        businessType: b.type,
        address: b.addr,
        district: 'Salem',
        latitude: 11.6643 + (Math.random() - 0.5) * 0.08,
        longitude: 78.1460 + (Math.random() - 0.5) * 0.08,
        verified: true,
      },
    });
    allBuyers.push(prof);
  }

  // 5. SEED PRODUCE BATCHES (Scenario 1 & 2 Specifics)
  console.log('🍅 Seeding Produce Batches with Freshness states...');
  const now = new Date();

  // Batch A: Farmer Kumar (100 kg, Tomato, Grade A, ₹22, 5 km) - FRESH
  const batchA = await prisma.produceBatch.create({
    data: {
      batchCode: 'TOM-2026-00101',
      farmerId: allFarmers[0].id, // Kumar
      productId: createdProducts['Tomato'].id,
      quantity: 100,
      initialQuantity: 100,
      pricePerKg: 22,
      qualityGrade: 'A',
      harvestedAt: new Date(now.getTime() - 2 * 3600 * 1000), // 2h ago (6:00 AM)
      sellBy: new Date(now.getTime() + 10 * 3600 * 1000), // 10h remaining
      freshnessStatus: 'FRESH',
      status: 'ACTIVE',
      village: 'Thalaivasal',
      latitude: 11.5833,
      longitude: 78.5833,
      imageUrl: createdProducts['Tomato'].imageUrl,
      notes: 'Morning harvest, premium ripe firm tomatoes',
    },
  });

  // Batch B: Farmer Murugan (150 kg, Tomato, Grade A, ₹23, 8 km) - FRESH
  const batchB = await prisma.produceBatch.create({
    data: {
      batchCode: 'TOM-2026-00102',
      farmerId: allFarmers[1].id, // Murugan
      productId: createdProducts['Tomato'].id,
      quantity: 150,
      initialQuantity: 150,
      pricePerKg: 23,
      qualityGrade: 'A',
      harvestedAt: new Date(now.getTime() - 3 * 3600 * 1000),
      sellBy: new Date(now.getTime() + 9 * 3600 * 1000),
      freshnessStatus: 'FRESH',
      status: 'ACTIVE',
      village: 'Attur',
      latitude: 11.5997,
      longitude: 78.6012,
      imageUrl: createdProducts['Tomato'].imageUrl,
    },
  });

  // Batch C: Farmer Priya (100 kg, Tomato, Grade B, ₹21, 12 km) - AGING
  const batchC = await prisma.produceBatch.create({
    data: {
      batchCode: 'TOM-2026-00103',
      farmerId: allFarmers[2].id, // Priya
      productId: createdProducts['Tomato'].id,
      quantity: 100,
      initialQuantity: 100,
      pricePerKg: 21,
      qualityGrade: 'B',
      harvestedAt: new Date(now.getTime() - 8 * 3600 * 1000),
      sellBy: new Date(now.getTime() + 4 * 3600 * 1000),
      freshnessStatus: 'AGING',
      status: 'ACTIVE',
      village: 'Gangavalli',
      latitude: 11.5667,
      longitude: 78.5500,
      imageUrl: createdProducts['Tomato'].imageUrl,
      notes: 'Slightly ripe, ideal for hotel curries and sauces',
    },
  });

  // Batch D: Farmer Ravi (150 kg, Tomato, Grade A, ₹22, 10 km) - FRESH
  const batchD = await prisma.produceBatch.create({
    data: {
      batchCode: 'TOM-2026-00104',
      farmerId: allFarmers[3].id, // Ravi
      productId: createdProducts['Tomato'].id,
      quantity: 150,
      initialQuantity: 150,
      pricePerKg: 22,
      qualityGrade: 'A',
      harvestedAt: new Date(now.getTime() - 1 * 3600 * 1000),
      sellBy: new Date(now.getTime() + 11 * 3600 * 1000),
      freshnessStatus: 'FRESH',
      status: 'ACTIVE',
      village: 'Mecheri',
      latitude: 11.8333,
      longitude: 77.9500,
      imageUrl: createdProducts['Tomato'].imageUrl,
    },
  });

  // Batch E: URGENT SALE Brinjal Batch (Scenario 2 Perishable Demonstration)
  const batchUrgent = await prisma.produceBatch.create({
    data: {
      batchCode: 'BRN-2026-00088',
      farmerId: allFarmers[4].id,
      productId: createdProducts['Brinjal'].id,
      quantity: 120,
      initialQuantity: 150,
      pricePerKg: 24, // 15% discount applied
      qualityGrade: 'A',
      harvestedAt: new Date(now.getTime() - 14 * 3600 * 1000),
      sellBy: new Date(now.getTime() + 1.5 * 3600 * 1000), // 1h 30m remaining!
      freshnessStatus: 'URGENT',
      status: 'ACTIVE',
      village: 'Valapadi',
      latitude: 11.6500,
      longitude: 78.4167,
      imageUrl: createdProducts['Brinjal'].imageUrl,
      notes: 'Urgent harvest sale - tender country brinjals needing quick delivery',
    },
  });

  // Batch F: EXPIRED Batch (Shows expired listing rules)
  await prisma.produceBatch.create({
    data: {
      batchCode: 'LFG-2026-00012',
      farmerId: allFarmers[5].id,
      productId: createdProducts['Leafy Greens'].id,
      quantity: 0,
      initialQuantity: 80,
      pricePerKg: 12,
      qualityGrade: 'B',
      harvestedAt: new Date(now.getTime() - 20 * 3600 * 1000),
      sellBy: new Date(now.getTime() - 4 * 3600 * 1000),
      freshnessStatus: 'EXPIRED',
      status: 'EXPIRED',
      village: 'Thalaivasal',
      imageUrl: createdProducts['Leafy Greens'].imageUrl,
      notes: 'Expired batch archived from marketplace',
    },
  });

  // Additional varied batches for Onions, Potatoes, Bananas, Coconuts
  const otherProducts = ['Onion', 'Potato', 'Banana', 'Coconut'];
  for (let i = 6; i < allFarmers.length; i++) {
    const prodName = otherProducts[i % otherProducts.length];
    const prod = createdProducts[prodName];
    await prisma.produceBatch.create({
      data: {
        batchCode: `${prod.name.slice(0, 3).toUpperCase()}-2026-${String(200 + i).padStart(5, '0')}`,
        farmerId: allFarmers[i].id,
        productId: prod.id,
        quantity: Math.floor(Math.random() * 300) + 100,
        initialQuantity: 400,
        pricePerKg: prod.referenceMinPrice + Math.floor(Math.random() * 5),
        qualityGrade: i % 3 === 0 ? 'A' : 'B',
        harvestedAt: new Date(now.getTime() - (i % 6) * 3600 * 1000),
        sellBy: new Date(now.getTime() + (prod.defaultShelfHours - 4) * 3600 * 1000),
        freshnessStatus: 'FRESH',
        status: 'ACTIVE',
        village: allFarmers[i].village,
        imageUrl: prod.imageUrl,
      },
    });
  }

  // 6. SEED BUYER DEMAND (Scenario 1: ABC Hotel needs 500 kg Tomato)
  console.log('📋 Seeding Buyer Demands...');
  const demandAbc = await prisma.buyerDemand.create({
    data: {
      demandCode: 'DEM-2026-0001',
      buyerId: buyerAbcProfile.id,
      productId: createdProducts['Tomato'].id,
      requiredQuantity: 500,
      minBudget: 20,
      maxBudget: 25,
      requiredGrade: 'A',
      deliveryDeadline: new Date(now.getTime() + 6 * 3600 * 1000), // today before 10 AM
      location: 'Omalur Main Road, Fairlands, Salem',
      district: 'Salem',
      latitude: 11.6643,
      longitude: 78.1460,
      maxDistanceKm: 20,
      status: 'OPEN',
      notes: 'Fresh morning harvest preferred for daily restaurant & banquet service.',
    },
  });

  // Second Demand: Green Valley Supermarket needing 300 kg Brinjal
  const demandSupermarket = await prisma.buyerDemand.create({
    data: {
      demandCode: 'DEM-2026-0002',
      buyerId: allBuyers[1].id,
      productId: createdProducts['Brinjal'].id,
      requiredQuantity: 300,
      minBudget: 24,
      maxBudget: 30,
      requiredGrade: 'A',
      deliveryDeadline: new Date(now.getTime() + 12 * 3600 * 1000),
      location: 'Five Roads, Salem',
      district: 'Salem',
      latitude: 11.6700,
      longitude: 78.1400,
      maxDistanceKm: 25,
      status: 'OPEN',
    },
  });

  // 7. SEED OFFERS & NEGOTIATIONS (Including Counter-Offer History)
  console.log('🤝 Seeding Offers & Counter-Offers...');
  const offer1 = await prisma.offer.create({
    data: {
      demandId: demandAbc.id,
      batchId: batchA.id,
      buyerId: buyerAbcProfile.id,
      farmerId: allFarmers[0].id, // Kumar
      offeredPricePerKg: 22,
      quantity: 100,
      status: 'COUNTERED',
      isCounterOffer: true,
      notes: 'Negotiating price per kg',
    },
  });

  await prisma.offerHistory.createMany({
    data: [
      {
        offerId: offer1.id,
        proposedByUserId: buyerAbcUser.id,
        pricePerKg: 21,
        notes: 'Buyer proposed ₹21/kg for 100 kg bulk commitment',
      },
      {
        offerId: offer1.id,
        proposedByUserId: farmerKumarUser.id,
        pricePerKg: 23,
        notes: 'Farmer counter-offered ₹23/kg for Grade A freshly harvested tomatoes',
      },
      {
        offerId: offer1.id,
        proposedByUserId: buyerAbcUser.id,
        pricePerKg: 22,
        notes: 'Buyer countered with final compromise of ₹22/kg',
      },
    ],
  });

  // 8. SEED ONE COMPLETED COLLECTIVE ORDER (Demonstrating Full State Machine)
  console.log('🚚 Seeding Active & Completed Collective Orders...');
  const collectiveOrder1 = await prisma.collectiveOrder.create({
    data: {
      collectiveCode: 'COL-2026-00010',
      demandId: demandAbc.id,
      totalQuantity: 400,
      agreedPricePerKg: 23,
      totalAmount: 9200,
      status: 'COMPLETED',
    },
  });

  await prisma.collectiveOrderMember.createMany({
    data: [
      {
        collectiveOrderId: collectiveOrder1.id,
        farmerId: allFarmers[0].id,
        batchId: batchA.id,
        allocatedQuantity: 100,
        payoutAmount: 2254, // 100 * 23 * 0.98
        status: 'ACCEPTED',
      },
      {
        collectiveOrderId: collectiveOrder1.id,
        farmerId: allFarmers[1].id,
        batchId: batchB.id,
        allocatedQuantity: 150,
        payoutAmount: 3381, // 150 * 23 * 0.98
        status: 'ACCEPTED',
      },
      {
        collectiveOrderId: collectiveOrder1.id,
        farmerId: allFarmers[3].id,
        batchId: batchD.id,
        allocatedQuantity: 150,
        payoutAmount: 3381,
        status: 'ACCEPTED',
      },
    ],
  });

  const order1 = await prisma.order.create({
    data: {
      orderCode: 'ORD-1024',
      buyerId: buyerAbcProfile.id,
      collectiveOrderId: collectiveOrder1.id,
      totalQuantity: 400,
      totalAmount: 9200,
      platformFee: 184, // 2%
      farmerPayout: 9016,
      status: 'COMPLETED',
      deliveryAddress: 'Omalur Main Road, Fairlands, Salem',
      scheduledPickupTime: new Date(now.getTime() - 5 * 3600 * 1000),
      deliveredAt: new Date(now.getTime() - 1 * 3600 * 1000),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      { orderId: order1.id, farmerId: allFarmers[0].id, batchId: batchA.id, quantity: 100, pricePerKg: 23, total: 2300 },
      { orderId: order1.id, farmerId: allFarmers[1].id, batchId: batchB.id, quantity: 150, pricePerKg: 23, total: 3450 },
      { orderId: order1.id, farmerId: allFarmers[3].id, batchId: batchD.id, quantity: 150, pricePerKg: 23, total: 3450 },
    ],
  });

  // Quality Check Record for Order 1
  await prisma.qualityCheck.create({
    data: {
      orderId: order1.id,
      batchId: batchA.id,
      inspectorId: coordSelvamUser.id,
      expectedQty: 100,
      actualQty: 98,
      damagedQty: 2,
      acceptedQty: 96,
      gradeAssigned: 'A',
      damagePercentage: 2.0,
      remarks: 'Certified Grade A firm red tomatoes. Minor sorting loss of 2kg recorded.',
      status: 'PASSED',
    },
  });

  // Delivery Record for Order 1
  await prisma.delivery.create({
    data: {
      orderId: order1.id,
      vehicleId: vehicle1.id,
      currentLat: 11.6643,
      currentLng: 78.1460,
      status: 'DELIVERED',
      startedAt: new Date(now.getTime() - 3 * 3600 * 1000),
      completedAt: new Date(now.getTime() - 1 * 3600 * 1000),
    },
  });

  // Payment Record & Farmer Payouts for Order 1
  const payment1 = await prisma.payment.create({
    data: {
      paymentCode: 'PAY-1024',
      orderId: order1.id,
      buyerId: buyerAbcProfile.id,
      amount: 9200,
      platformFee: 184,
      status: 'RELEASED',
      paymentMethod: 'MOCK_UPI',
      transactionRef: 'UPI-TXN-88492019',
      releasedAt: new Date(now.getTime() - 1 * 3600 * 1000),
    },
  });

  await prisma.farmerPayout.createMany({
    data: [
      { paymentId: payment1.id, farmerId: allFarmers[0].id, amount: 2254, status: 'RELEASED', utrRef: 'UTR-99102401', releasedAt: new Date() },
      { paymentId: payment1.id, farmerId: allFarmers[1].id, amount: 3381, status: 'RELEASED', utrRef: 'UTR-99102402', releasedAt: new Date() },
      { paymentId: payment1.id, farmerId: allFarmers[3].id, amount: 3381, status: 'RELEASED', utrRef: 'UTR-99102403', releasedAt: new Date() },
    ],
  });

  // Mutual Ratings for Order 1
  await prisma.rating.createMany({
    data: [
      {
        orderId: order1.id,
        fromUserId: buyerAbcUser.id,
        toUserId: farmerKumarUser.id,
        score: 5,
        comment: 'Exceptionally fresh tomatoes, punctual delivery at hotel dock before 8 AM!',
      },
      {
        orderId: order1.id,
        fromUserId: farmerKumarUser.id,
        toUserId: buyerAbcUser.id,
        score: 5,
        comment: 'Prompt payment release upon delivery confirmation, very professional hotel management.',
      },
    ],
  });

  // 9. SEED NOTIFICATIONS (In-app, SMS Mock, WhatsApp Mock, Voice Mock)
  console.log('🔔 Seeding Notifications across channels...');
  await prisma.notification.createMany({
    data: [
      {
        userId: farmerKumarUser.id,
        title: 'புதிய Offer வந்துள்ளது! (New Offer)',
        message: 'ABC Grand Heritage Hotel has offered ₹22/kg for 100 kg of Tomato (TOM-2026-00101).',
        type: 'NEW_OFFER',
        channel: 'IN_APP',
      },
      {
        userId: farmerKumarUser.id,
        title: 'பணம் உங்கள் கணக்கில் செலுத்தப்பட்டது! (Payment Released)',
        message: 'Order #ORD-1024 payout of ₹2,254 has been credited to your bank account via UPI. UTR: UTR-99102401.',
        type: 'PAYMENT_RELEASED',
        channel: 'SMS_MOCK',
      },
      {
        userId: buyerAbcUser.id,
        title: 'Collective Supply Match Found!',
        message: 'Your demand DEM-2026-0001 (500 kg Tomato) has 4 nearby verified farmers matching 100% of requirement.',
        type: 'NEW_DEMAND',
        channel: 'IN_APP',
      },
      {
        userId: buyerAbcUser.id,
        title: 'Urgent Perishable Batch Nearby!',
        message: 'Fresh Brinjal 120 kg available in Valapadi at discounted price ₹24/kg. Sell-by time in 90 mins.',
        type: 'URGENT_SALE',
        channel: 'WHATSAPP_MOCK',
      },
      {
        userId: coordSelvamUser.id,
        title: 'Assisted Farmer Profile Active',
        message: 'Farmer Kumar Govindasamy has 1 active produce batch ready for collection center drop-off.',
        type: 'ORDER_CONFIRMED',
        channel: 'IN_APP',
      },
    ],
  });

  console.log('====================================================');
  console.log('✅ KisanDirect Database Seed Complete!');
  console.log('====================================================');
  console.log('Demo Credentials:');
  console.log('👑 Admin:       admin@kisandirect.demo       / Demo@123');
  console.log('🌾 Farmer:      farmer@kisandirect.demo      / Demo@123 (Kumar)');
  console.log('🏨 Buyer:       buyer@kisandirect.demo       / Demo@123 (ABC Hotel)');
  console.log('🤝 Coordinator: coordinator@kisandirect.demo / Demo@123 (Selvam)');
  console.log('🚚 Logistics:   logistics@kisandirect.demo   / Demo@123 (Ravi)');
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
