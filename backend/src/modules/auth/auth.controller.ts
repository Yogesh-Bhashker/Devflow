import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../lib/prisma";
import { JWT_SECRET } from "../../config/env";

const REFRESH_TOKEN_DAYS = 7;

function createAccessToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });
}

async function createRefreshToken(userId: number) {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
  const record = await prisma.refreshToken.create({ data: { userId, expiresAt } });
  return jwt.sign({ userId, tokenId: record.id }, JWT_SECRET, { expiresIn: `${REFRESH_TOKEN_DAYS}d` });
}

function setRefreshCookie(res: Response, token: string) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: false, // set true once you deploy behind HTTPS
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  });
}

export const register = async (req: Request, res: Response) => {
  try {
    // Validation is handled by Zod in auth.routes.ts
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    res.status(201).json({ message: "User registered", user });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Email already in use" });
    }
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Validation is handled by Zod in auth.routes.ts
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = createAccessToken(user.id);
    const refreshToken = await createRefreshToken(user.id);
    setRefreshCookie(res, refreshToken);

    res.json({
      message: "Login successful",
      accessToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; tokenId: string };

    const stored = await prisma.refreshToken.findUnique({ where: { id: payload.tokenId } });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ message: "Refresh token expired or revoked" });
    }

    const accessToken = createAccessToken(payload.userId);
    res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET) as { tokenId: string };
        await prisma.refreshToken.delete({ where: { id: payload.tokenId } });
      } catch {
        // token already invalid, nothing to clean up
      }
    }
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};