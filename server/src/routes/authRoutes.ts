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
      avatarUrl,
      preferredLanguage = 'en',
      // Farmer specific
      village,
      district,
      state = 'Tamil Nadu',
      landSize,
      farmingType,
      mainCrops,
      experienceYears,
      // Buyer specific
      businessName,
      businessType,
      consumerType,
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
    const activeRole = role === 'BUYER' ? 'BUYER' : role === 'FARMER' ? 'FARMER' : role;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        mobile,
        passwordHash,
        role,
        activeRole,
        avatarUrl: avatarUrl || null,
        preferredLanguage,
      },
    });

    // Create role-specific profiles
    let createdFarmerProfile = null;
    let createdBuyerProfile = null;
    let createdCoordinatorProfile = null;

    if (role === 'FARMER') {
      const farmerCount = await prisma.farmerProfile.count();
      const farmerId = `FD-${1000 + farmerCount + 1}`;

      createdFarmerProfile = await prisma.farmerProfile.create({
        data: {
          userId: user.id,
          farmerId,
          village: village || 'Thalaivasal',
          district: district || 'Salem',
          state,
          landSize: landSize ? parseFloat(landSize) : 2.5,
          farmingType: farmingType || 'Conventional',
          mainCrops: mainCrops || 'Tomato, Brinjal, Onion',
          experienceYears: experienceYears ? parseInt(experienceYears) : 5,
          identityVerificationStatus: 'VERIFIED',
          farmVerificationStatus: 'VERIFIED',
          rating: 4.8,
          completedOrders: 0,
          verified: true,
        },
      });
    } else if (role === 'BUYER') {
      createdBuyerProfile = await prisma.buyerProfile.create({
        data: {
          userId: user.id,
          businessName: businessName || name,
          ownerName: name,
          businessType: businessType || 'HOTEL',
          consumerType: consumerType || businessType || 'INDIVIDUAL',
          gstNumber: gstNumber || null,
          address: address || 'Salem Central Market',
          district: district || 'Salem',
          verified: true,
        },
      });
    } else if (role === 'COORDINATOR') {
      createdCoordinatorProfile = await prisma.coordinatorProfile.create({
        data: {
          userId: user.id,
          village: village || 'Thalaivasal',
          district: district || 'Salem',
          verified: true,
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, activeRole: user.activeRole, name: user.name },
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
        activeRole: user.activeRole,
        avatarUrl: user.avatarUrl,
        preferredLanguage: user.preferredLanguage,
        farmerProfile: createdFarmerProfile,
        buyerProfile: createdBuyerProfile,
        coordinatorProfile: createdCoordinatorProfile,
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

    const activeRole = user.activeRole || user.role;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, activeRole, name: user.name },
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
        activeRole,
        avatarUrl: user.avatarUrl,
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

    const activeRole = role;
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, activeRole, name: user.name },
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
        activeRole,
        avatarUrl: user.avatarUrl,
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

// Switch active role between FARMER and BUYER (Multi-Role Support)
router.post('/switch-role', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { activeRole } = req.body;
    if (!activeRole || !['FARMER', 'BUYER', 'COORDINATOR'].includes(activeRole)) {
      res.status(400).json({ error: 'Invalid active role specified' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: { activeRole },
      include: {
        farmerProfile: true,
        buyerProfile: true,
        coordinatorProfile: true,
      },
    });

    const token = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role, activeRole: updatedUser.activeRole, name: updatedUser.name },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: `Switched active mode to ${activeRole}`,
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        role: updatedUser.role,
        activeRole: updatedUser.activeRole,
        avatarUrl: updatedUser.avatarUrl,
        preferredLanguage: updatedUser.preferredLanguage,
        farmerProfile: updatedUser.farmerProfile,
        buyerProfile: updatedUser.buyerProfile,
        coordinatorProfile: updatedUser.coordinatorProfile,
      },
    });
  } catch (error: any) {
    console.error('Switch role error:', error);
    res.status(500).json({ error: error.message || 'Failed to switch role' });
  }
});

// Setup secondary profile (Multi-role account completion)
router.post('/setup-profile', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role, village, district, landSize, farmingType, mainCrops, businessName, businessType, consumerType, address } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { farmerProfile: true, buyerProfile: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (role === 'FARMER' && !user.farmerProfile) {
      const count = await prisma.farmerProfile.count();
      const farmerId = `FD-${1000 + count + 1}`;
      await prisma.farmerProfile.create({
        data: {
          userId: user.id,
          farmerId,
          village: village || 'Thalaivasal',
          district: district || 'Salem',
          state: 'Tamil Nadu',
          landSize: landSize ? parseFloat(landSize) : 2.5,
          farmingType: farmingType || 'Conventional',
          mainCrops: mainCrops || 'Tomato, Brinjal, Onion',
          identityVerificationStatus: 'VERIFIED',
          farmVerificationStatus: 'VERIFIED',
          rating: 4.8,
          completedOrders: 0,
          verified: true,
        },
      });
    } else if (role === 'BUYER' && !user.buyerProfile) {
      await prisma.buyerProfile.create({
        data: {
          userId: user.id,
          businessName: businessName || `${user.name}'s Kitchen`,
          ownerName: user.name,
          businessType: businessType || 'HOTEL',
          consumerType: consumerType || businessType || 'INDIVIDUAL',
          address: address || 'Salem Central Market',
          district: district || 'Salem',
          verified: true,
        },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { activeRole: role },
      include: { farmerProfile: true, buyerProfile: true, coordinatorProfile: true },
    });

    const token = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role, activeRole: updatedUser.activeRole, name: updatedUser.name },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Profile setup completed',
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        role: updatedUser.role,
        activeRole: updatedUser.activeRole,
        avatarUrl: updatedUser.avatarUrl,
        preferredLanguage: updatedUser.preferredLanguage,
        farmerProfile: updatedUser.farmerProfile,
        buyerProfile: updatedUser.buyerProfile,
        coordinatorProfile: updatedUser.coordinatorProfile,
      },
    });
  } catch (error: any) {
    console.error('Setup profile error:', error);
    res.status(500).json({ error: error.message || 'Failed to setup profile' });
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
        activeRole: user.activeRole || user.role,
        avatarUrl: user.avatarUrl,
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
