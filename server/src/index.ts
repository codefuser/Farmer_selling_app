import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import farmerRoutes from './routes/farmerRoutes.js';
import buyerRoutes from './routes/buyerRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import logisticsRoutes from './routes/logisticsRoutes.js';
import qualityRoutes from './routes/qualityRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import coordinatorRoutes from './routes/coordinatorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import demoRoutes from './routes/demoRoutes.js';
import marketPriceRoutes from './routes/marketPriceRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*', // allow development frontend
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/buyers', buyerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/quality-checks', qualityRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/coordinator', coordinatorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/market-prices', marketPriceRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    product: 'KisanDirect',
    problemStatementId: 'SIH26033',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = ENV.PORT;
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 KisanDirect API Server running on port ${PORT}`);
  console.log(`🌾 SIH 2026 Problem Statement ID: SIH26033`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
