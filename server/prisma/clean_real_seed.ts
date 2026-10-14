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
  console.log('✨ Ulavar2Ulagam: Initializing Pristine Shopping Catalog');
  console.log('🌾 No Demo Users · Accurate Verified Images · No Duplicates');
  console.log('🌾 ====================================================');

  // 1. Clean existing records
  console.log('🧹 Cleaning old demo data and duplicate listings...');
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
    console.log('Clean note:', err.message);
  }

  // 2. Real Admin Operations Account
  console.log('👤 Creating Authorized Administrator Account...');
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const adminUser = await prisma.user.create({
    data: {
      name: 'Ulavar2Ulagam Operations Admin',
      email: 'admin@ulavar2ulagam.com',
      mobile: '9876543210',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      activeRole: 'ADMIN',
      preferredLanguage: 'ta',
    },
  });

  // 3. Pristine Catalog of 20 Authentic Products with verified, non-duplicate images
  console.log('🛒 Populating Verified Products with Authentic Photography...');

  const verifiedCatalog = [
    // --- VEGETABLES ---
    {
      name: 'Country Tomato',
      nameTamil: 'நாட்டு தக்காளி',
      category: 'VEGETABLES',
      unit: 'kg',
      stockQuantity: 180,
      lowStockThreshold: 30,
      sellingPrice: 28,
      avgProcurementCost: 20,
      referenceMinPrice: 22,
      referenceMaxPrice: 32,
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      description: 'Naturally ripened Salem country tomatoes with rich sour tang, perfect for authentic sambar and rasam. Harvested fresh daily.',
    },
    {
      name: 'Small Onion / Shallots',
      nameTamil: 'சின்ன வெங்காயம்',
      category: 'VEGETABLES',
      unit: 'kg',
      stockQuantity: 110,
      lowStockThreshold: 25,
      sellingPrice: 55,
      avgProcurementCost: 42,
      referenceMinPrice: 48,
      referenceMaxPrice: 62,
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
      description: 'Pungent, authentic small sambar onions direct from Salem and Perambalur farmer clusters. Sun-cured with long shelf life.',
    },
    {
      name: 'Bellary Big Onion',
      nameTamil: 'பெரிய வெங்காயம்',
      category: 'VEGETABLES',
      unit: 'kg',
      stockQuantity: 150,
      lowStockThreshold: 30,
      sellingPrice: 36,
      avgProcurementCost: 26,
      referenceMinPrice: 30,
      referenceMaxPrice: 42,
      imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80',
      description: 'Crisp, sweet pink large onions graded for everyday cooking, curries, and salads.',
    },
    {
      name: 'Farm Fresh Potato',
      nameTamil: 'உருளைக்கிழங்கு',
      category: 'VEGETABLES',
      unit: 'kg',
      stockQuantity: 200,
      lowStockThreshold: 40,
      sellingPrice: 26,
      avgProcurementCost: 18,
      referenceMinPrice: 22,
      referenceMaxPrice: 30,
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
      description: 'Earthy golden potatoes harvested from Nilgiris and Salem hills, firm and non-sprouted.',
    },
    {
      name: 'Sweet Carrot',
      nameTamil: 'கேரட்',
      category: 'VEGETABLES',
      unit: 'kg',
      stockQuantity: 90,
      lowStockThreshold: 20,
      sellingPrice: 46,
      avgProcurementCost: 34,
      referenceMinPrice: 40,
      referenceMaxPrice: 54,
      imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
      description: 'Crisp, vibrant orange carrots harvested from cool hill farms. Juicy and naturally sweet.',
    },
    {
      name: 'Purple Brinjal',
      nameTamil: 'கத்தரிக்காய்',
      category: 'VEGETABLES',
      unit: 'kg',
      stockQuantity: 75,
      lowStockThreshold: 20,
      sellingPrice: 34,
      avgProcurementCost: 24,
      referenceMinPrice: 28,
      referenceMaxPrice: 40,
      imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
      description: 'Glossy, tender local purple eggplants free from chemical sprays, ideal for vatha kuzhambu and poriyal.',
    },
    {
      name: 'Fresh Drumstick',
      nameTamil: 'முருங்கைக்காய்',
      category: 'VEGETABLES',
      unit: 'kg',
      stockQuantity: 60,
      lowStockThreshold: 15,
      sellingPrice: 64,
      avgProcurementCost: 46,
      referenceMinPrice: 52,
      referenceMaxPrice: 72,
      imageUrl: '/images/drumstick.jpg',
      description: 'Long, fleshy drumsticks from Aravakurichi farm clusters with tender seeds and high nutrition.',
    },
    {
      name: 'Tender Ladies Finger (Okra)',
      nameTamil: 'வெண்டைக்காய்',
      category: 'VEGETABLES',
      unit: 'kg',
      stockQuantity: 70,
      lowStockThreshold: 20,
      sellingPrice: 38,
      avgProcurementCost: 28,
      referenceMinPrice: 32,
      referenceMaxPrice: 44,
      imageUrl: 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&w=600&q=80',
      description: 'Tender young okra pods that snap easily, rich in soluble dietary fiber and vitamins.',
    },
    {
      name: 'Spicy Green Chilli',
      nameTamil: 'பச்சை மிளகாய்',
      category: 'VEGETABLES',
      unit: 'kg',
      stockQuantity: 45,
      lowStockThreshold: 15,
      sellingPrice: 52,
      avgProcurementCost: 38,
      referenceMinPrice: 45,
      referenceMaxPrice: 60,
      imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80',
      description: 'Sharp, aromatic green chillies picked fresh from local farm beds.',
    },
    {
      name: 'Fresh Green Cabbage',
      nameTamil: 'முட்டைக்கோஸ்',
      category: 'VEGETABLES',
      unit: 'kg',
      stockQuantity: 80,
      lowStockThreshold: 20,
      sellingPrice: 24,
      avgProcurementCost: 16,
      referenceMinPrice: 20,
      referenceMaxPrice: 28,
      imageUrl: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80',
      description: 'Tightly packed, crisp heads of green cabbage grown in pesticide-managed soil.',
    },
    {
      name: 'Farm Beetroot',
      nameTamil: 'பீட்ரூட்',
      category: 'VEGETABLES',
      unit: 'kg',
      stockQuantity: 65,
      lowStockThreshold: 18,
      sellingPrice: 36,
      avgProcurementCost: 25,
      referenceMinPrice: 30,
      referenceMaxPrice: 42,
      imageUrl: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=600&q=80',
      description: 'Deep ruby-red sweet beetroots, packed with iron and antioxidants.',
    },

    // --- GREENS ---
    {
      name: 'Siru Keerai',
      nameTamil: 'சிறுகீரை',
      category: 'GREENS',
      unit: 'bunch',
      stockQuantity: 50,
      lowStockThreshold: 15,
      sellingPrice: 20,
      avgProcurementCost: 14,
      referenceMinPrice: 15,
      referenceMaxPrice: 24,
      imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80',
      description: 'Harvested at dawn, carefully washed and bundled. Tender leafy greens packed with micro-nutrients.',
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
      referenceMaxPrice: 24,
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      description: 'Traditional South Indian herbal spinach variety, harvested fresh every morning.',
    },

    // --- FRUITS ---
    {
      name: 'Salem Malgova Mango',
      nameTamil: 'சேலம் மாம்பழம்',
      category: 'FRUITS',
      unit: 'kg',
      stockQuantity: 85,
      lowStockThreshold: 20,
      sellingPrice: 135,
      avgProcurementCost: 100,
      referenceMinPrice: 115,
      referenceMaxPrice: 155,
      imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
      description: 'Geographical-indication quality Salem Malgova mangoes. Tree-ripened without any chemical carbide.',
    },
    {
      name: 'Yelakki Banana',
      nameTamil: 'ஏலக்கி வாழைப்பழம்',
      category: 'FRUITS',
      unit: 'kg',
      stockQuantity: 95,
      lowStockThreshold: 25,
      sellingPrice: 58,
      avgProcurementCost: 42,
      referenceMinPrice: 50,
      referenceMaxPrice: 65,
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
      description: 'Fragrant baby bananas with thin golden peel, harvested along Mohanur and Cauvery river banks.',
    },

    // --- GRAINS ---
    {
      name: 'Ponni Raw Rice (1-Year Aged)',
      nameTamil: 'பொன்னி அரிசி',
      category: 'GRAINS',
      unit: 'kg',
      stockQuantity: 300,
      lowStockThreshold: 60,
      sellingPrice: 58,
      avgProcurementCost: 46,
      referenceMinPrice: 52,
      referenceMaxPrice: 65,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      description: '1-year aged premium Cauvery basin Ponni raw rice. Fluffy texture, non-sticky and delicious for daily meals.',
    },
    {
      name: 'BPT Sona Masoori Rice',
      nameTamil: 'சோனா மசூரி அரிசி',
      category: 'GRAINS',
      unit: 'kg',
      stockQuantity: 220,
      lowStockThreshold: 50,
      sellingPrice: 62,
      avgProcurementCost: 49,
      referenceMinPrice: 55,
      referenceMaxPrice: 70,
      imageUrl: 'https://images.unsplash.com/photo-1568651347477-941c43aa41bf?auto=format&fit=crop&w=600&q=80',
      description: 'Lightweight aromatic table rice, unpolished and naturally milled for healthy digestion.',
    },

    // --- PULSES ---
    {
      name: 'First Grade Toor Dal',
      nameTamil: 'துவரம் பருப்பு',
      category: 'PULSES',
      unit: 'kg',
      stockQuantity: 120,
      lowStockThreshold: 30,
      sellingPrice: 145,
      avgProcurementCost: 118,
      referenceMinPrice: 135,
      referenceMaxPrice: 160,
      imageUrl: 'https://images.unsplash.com/photo-1585994192701-f1a505c817ea?auto=format&fit=crop&w=600&q=80',
      description: 'Unpolished protein-rich toor dal that melts smoothly for authentic South Indian sambar.',
    },
    {
      name: 'Organic Moong Dal',
      nameTamil: 'பாசிப் பருப்பு',
      category: 'PULSES',
      unit: 'kg',
      stockQuantity: 90,
      lowStockThreshold: 25,
      sellingPrice: 125,
      avgProcurementCost: 98,
      referenceMinPrice: 115,
      referenceMaxPrice: 138,
      imageUrl: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
      description: 'Natural yellow split moong dal, easy on digestion, rich in minerals and free from yellow dye.',
    },

    // --- SEASONAL ---
    {
      name: 'Pollachi Tender Coconut',
      nameTamil: 'செவ்விளநீர்',
      category: 'SEASONAL',
      unit: 'piece',
      stockQuantity: 100,
      lowStockThreshold: 25,
      sellingPrice: 45,
      avgProcurementCost: 32,
      referenceMinPrice: 38,
      referenceMaxPrice: 50,
      imageUrl: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=600&q=80',
      description: 'Sweet, electrolyte-packed Pollachi red tender coconuts containing 400ml+ pure cooling natural water.',
    },
  ];

  for (const item of verifiedCatalog) {
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
        status: 'IN_STOCK',
        isPublished: true,
      },
    });

    // Market price benchmark for Tamil Nadu
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
  }

  console.log(`✅ Successfully loaded ${verifiedCatalog.length} accurate, non-duplicate products!`);
  console.log(`🔑 Admin Login: admin@ulavar2ulagam.com / Admin@123`);
  console.log('🌾 Ready for end-to-end shopping & real farmer-to-business operations.');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
