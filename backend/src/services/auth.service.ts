import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt';

const prisma = new PrismaClient();

export class AuthService {
  async register(email: string, name: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const error = new Error('Email is already registered') as Error & { statusCode: number };
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, name, passwordHash },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const tokenPayload = { userId: user.id, email: user.email, name: user.name };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return { user, accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const error = new Error('Invalid email or password') as Error & { statusCode: number };
      error.statusCode = 401;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      const error = new Error('Invalid email or password') as Error & { statusCode: number };
      error.statusCode = 401;
      throw error;
    }

    const tokenPayload = { userId: user.id, email: user.email, name: user.name };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };

    return { user: userResponse, accessToken, refreshToken };
  }

  async refresh(token: string) {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      const error = new Error('Invalid or expired refresh token') as Error & { statusCode: number };
      error.statusCode = 401;
      throw error;
    }

    // Verify token signature
    const payload = verifyRefreshToken(token);

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { token } });

    const tokenPayload = {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    };
    const accessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.userId,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(token: string) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  async logoutAll(userId: string) {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
