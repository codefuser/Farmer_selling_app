import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'kisandirect_sih2026_super_secret_jwt_key_987654',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  MAPS_API_KEY: process.env.MAPS_API_KEY || 'mock_google_maps_key_demo',
  PAYMENT_API_KEY: process.env.PAYMENT_API_KEY || 'mock_razorpay_key_demo',
  SMS_API_KEY: process.env.SMS_API_KEY || 'mock_sms_key_demo',
  VOICE_API_KEY: process.env.VOICE_API_KEY || 'mock_voice_key_demo',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};
