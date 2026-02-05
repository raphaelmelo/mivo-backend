import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        isPremium: user.isPremium,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);

    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map((e: any) => e.message);
      res.status(400).json({ error: messages.join(', ') });
      return;
    }

    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Update last active date
    await user.update({ lastActiveDate: new Date() });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        isPremium: user.isPremium,
        lastActiveDate: user.lastActiveDate,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { goal, currentLevel, dailyTimeCommitment, company, productArea } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update onboarding profile data
    await user.update({
      goal: goal || null,
      currentLevel: currentLevel || null,
      dailyTimeCommitment: dailyTimeCommitment || null,
      company: company || null,
      productArea: productArea || null,
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        isPremium: user.isPremium,
        goal: user.goal,
        currentLevel: user.currentLevel,
        dailyTimeCommitment: user.dailyTimeCommitment,
        company: user.company,
        productArea: user.productArea,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Fetch League Info
    let leagueName = 'Bronze';
    let leagueTier = 'bronze';
    
    if (user.leagueId) {
       const { default: League } = await import('../models/League');
       const league = await League.findByPk(user.leagueId);
       if (league) {
         leagueName = league.name;
         leagueTier = league.tier;
       }
    } else {
        // Correct if User doesn't have league assigned yet
        const { LeagueService } = await import('../services/leagueService');
        await LeagueService.updateUserLeague(user);
        await user.save();
        
        if (user.leagueId) {
            const { default: League } = await import('../models/League');
            const league = await League.findByPk(user.leagueId);
            if (league) {
                leagueName = league.name;
                leagueTier = league.tier;
            }
        }
    }

    // Fetch Badges
    const { BadgeService } = await import('../services/badgeService');
    const badges = await BadgeService.getUserBadges(userId);

    res.status(200).json({
      user: {
        ...user.toJSON(),
        league: {
            name: leagueName,
            tier: leagueTier
        },
        badges: badges.map(b => b.name) // Returning names for frontend compatibility (string[])
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get full profile' });
  }
};
