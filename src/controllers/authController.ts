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
        goal: user.goal,
        currentLevel: user.currentLevel,
        dailyTimeCommitment: user.dailyTimeCommitment,
        company: user.company,
        productArea: user.productArea,
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
        goal: user.goal,
        currentLevel: user.currentLevel,
        dailyTimeCommitment: user.dailyTimeCommitment,
        company: user.company,
        productArea: user.productArea,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const linkedinLogin = async (req: Request, res: Response): Promise<void> => {
   try {
     console.log('Initiating LinkedIn Login...');
     const clientId = process.env.LINKEDIN_CLIENT_ID;
     const redirectUri = process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3002/api/auth/linkedin/callback';
     
     console.log('LinkedIn Config:', { 
       clientId: clientId ? '***' : 'MISSING', 
       redirectUri 
     });

     if (!clientId) {
       console.error('Missing LINKEDIN_CLIENT_ID');
       res.status(500).json({ error: 'Missing LinkedIn Client ID configuration' });
       return;
     }

     // Escopos para OpenID Connect: openid, profile, email
     const scope = 'openid profile email';
     const state = Math.random().toString(36).substring(7);

     const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
     
     console.log('Redirecting to:', authUrl);
     res.redirect(authUrl);
   } catch (error) {
     console.error('Error in linkedinLogin:', error);
     res.status(500).json({ error: 'Internal Server Error during LinkedIn Login initiation' });
   }
};

export const linkedinCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error('LinkedIn Auth Error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=linkedin_auth_failed`);
      return;
    }

    if (!code) {
       res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_code`);
       return;
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3002/api/auth/linkedin/callback';

    // 1. Trocar code por access token
    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code as string);
    params.append('redirect_uri', redirectUri);
    params.append('client_id', clientId!);
    params.append('client_secret', clientSecret!);

    const { default: axios } = await import('axios');
    
    const tokenResponse = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const accessToken = tokenResponse.data.access_token;

    // 2. Obter dados do usuário (OpenID Connect UserInfo)
    const userInfoUrl = 'https://api.linkedin.com/v2/userinfo';
    const userResponse = await axios.get(userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const userData = userResponse.data;
    // OIDC UserInfo response structure
    const email = userData.email;
    const linkedinId = userData.sub;
    const name = userData.name || `${userData.given_name} ${userData.family_name}`;
    const picture = userData.picture;
    
    if (!email) {
       res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_email_from_linkedin`);
       return;
    }

    // 3. Buscar ou criar usuário
    let user = await User.findOne({ where: { email } });

    if (user) {
       // Se usuário existe, vincula linkedinId se não tiver
       if (!user.linkedinId) {
         user.linkedinId = linkedinId;
         await user.save();
       }
    } else {
       // Cria novo usuário
       const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
       const hashedPassword = await bcrypt.hash(randomPassword, 10);

       user = await User.create({
         email,
         name,
         password: hashedPassword,
         linkedinId
       });
    }

    // 4. Atualizar última atividade
    await user.update({ lastActiveDate: new Date() });

    // 5. Gerar JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    // 6. Redirecionar para o frontend com token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/linkedin/callback?token=${token}`);

  } catch (error: any) {
    console.error('LinkedIn Callback Error:', error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=linkedin_callback_error`);
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
