import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { ENV } from '../config/env.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Register new user (Farmer, Buyer, Coordinator)
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      mobile,
      password,
      role,
      preferredLanguage = 'en',
      // Farmer specific
      village,
      district,
      state = 'Tamil Nadu',
      landSize,
      // Buyer specific
      businessName,
      businessType,
      gstNumber,
      address,
    } = req.body;

    if (!name || !email || !mobile || !password || !role) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { mobile }] },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User with this email or mobile already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        passwordHash,
        role,
        preferredLanguage,
      },
    });

    // Create role-specific profiles
    if (role === 'FARMER') {
      const farmerCount = await prisma.farmerProfile.count();
      const farmerId = `FD-${1000 + farmerCount + 1}`;

      await prisma.farmerProfile.create({
        data: {
          userId: user.id,
          farmerId,
          village: village || 'Thalaivasal',
          district: district || 'Salem',
          state,
          landSize: landSize ? parseFloat(landSize) : 2.5,
          rating: 4.8,
          completedOrders: 0,
          verified: true,
        },
      });
    } else if (role === 'BUYER') {
      await prisma.buyerProfile.create({
        data: {
          userId: user.id,
          businessName: businessName || name,
          ownerName: name,
          businessType: businessType || 'HOTEL',
          gstNumber: gstNumber || null,
          address: address || 'Salem Central Market',
          district: district || 'Salem',
          verified: true,
        },
      });
    } else if (role === 'COORDINATOR') {
      await prisma.coordinatorProfile.create({
        data: {
          userId: user.id,
          village: village || 'Thalaivasal',
          district: district || 'Salem',
          verified: true,
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      res.status(400).json({ error: 'Email/Mobile and password are required' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
      },
      include: {
        farmerProfile: true,
        buyerProfile: true,
        coordinatorProfile: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ error: 'Account suspended. Please contact administrator.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        farmerProfile: user.farmerProfile,
        buyerProfile: user.buyerProfile,
        coordinatorProfile: user.coordinatorProfile,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Mock OTP Verification
router.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  const { mobile, otp } = req.body;
  // Demo mock OTP acceptance: any 4 or 6 digit OTP or "1234" / "123456"
  if (!mobile || !otp) {
    res.status(400).json({ error: 'Mobile and OTP required' });
    return;
  }

  res.json({
    success: true,
    message: 'Mobile OTP verified successfully',
  });
});

// Demo Instant Persona Switcher
router.post('/demo-switch', async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    let targetEmail = 'farmer@kisandirect.demo';

    if (role === 'FARMER') targetEmail = 'farmer@kisandirect.demo';
    else if (role === 'BUYER') targetEmail = 'buyer@kisandirect.demo';
    else if (role === 'COORDINATOR') targetEmail = 'coordinator@kisandirect.demo';
    else if (role === 'LOGISTICS') targetEmail = 'logistics@kisandirect.demo';
    else if (role === 'ADMIN') targetEmail = 'admin@kisandirect.demo';

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        farmerProfile: true,
        buyerProfile: true,
        coordinatorProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Demo user not seeded yet' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: `Switched to demo persona: ${user.name} (${user.role})`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        farmerProfile: user.farmerProfile,
        buyerProfile: user.buyerProfile,
        coordinatorProfile: user.coordinatorProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        farmerProfile: true,
        buyerProfile: true,
        coordinatorProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        farmerProfile: user.farmerProfile,
        buyerProfile: user.buyerProfile,
        coordinatorProfile: user.coordinatorProfile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
