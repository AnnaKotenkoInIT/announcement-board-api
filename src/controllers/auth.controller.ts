import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import prisma from '../../prisma/client.ts';
import logger from '../logger.ts';

const JWT_SECRET = process.env.JWT_SECRET!;

const createAccessToken = (userId: number) => {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '15m' });
};

const createRefreshToken = (userId: number) => {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response) => {
  const { username, email, password, name } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    return res.status(409).json({
      error: 'Username or email already exists',
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      name,
    },
  });

  const accessToken = createAccessToken(user.id);
  const refreshToken = createRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
    },
  });

  logger.info(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
    },
    'User registered successfully',
  );

  return res.status(201).json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
    },
    accessToken,
    refreshToken,
  });
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      error: 'Invalid credentials',
    });
  }

  const accessToken = createAccessToken(user.id);
  const refreshToken = createRefreshToken(user.id);

  await prisma.refreshToken.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
    },
  });

  logger.info(
    {
      userId: user.id,
      username: user.username,
    },
    'User logged in successfully',
  );

  return res.status(200).json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
    },
    accessToken,
    refreshToken,
  });
};

export const getMe = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user!.sub,
    },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      error: 'User not found',
    });
  }

  return res.status(200).json(user);
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET);

    if (typeof payload !== 'object' || !payload.sub) {
      return res.status(401).json({
        error: 'Invalid refresh token',
      });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
    });

    if (!storedToken) {
      return res.status(401).json({
        error: 'Refresh token not found',
      });
    }

    const userId = Number(payload.sub);

    const accessToken = createAccessToken(userId);
    const newRefreshToken = createRefreshToken(userId);

    await prisma.refreshToken.delete({
      where: {
        token: refreshToken,
      },
    });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId,
      },
    });

    return res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch {
    return res.status(401).json({
      error: 'Invalid or expired refresh token',
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  await prisma.refreshToken.deleteMany({
    where: {
      token: refreshToken,
    },
  });

  return res.status(204).send();
};
