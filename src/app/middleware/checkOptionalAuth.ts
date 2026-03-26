import { NextFunction, Request, Response } from "express";
import { cookieUtils } from "../utilities/cookie";
import { jwtUtils } from "../utilities/jwt";
import { envVars } from "../config/env";
import { prisma } from "../lib/prisma";
import { JwtPayload } from "jsonwebtoken";

export const checkOptionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = cookieUtils.getCookie(req, "accessToken");
    if (!accessToken) {
      return next();
    }

    const verifyAccessToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);
    if (!verifyAccessToken.success || !verifyAccessToken.data) {
      return next();
    }

    const decoded = verifyAccessToken.data as JwtPayload;

    const refreshToken = cookieUtils.getCookie(req, "refreshToken");
    if (!refreshToken) {
      return next();
    }

    const session = await prisma.session.findFirst({
      where: {
        refreshToken,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!session || !session.user || decoded.id !== session.user.id) {
      return next();
    }

    const user = session.user;

    if (!user.isActive || user.isDeleted) {
      return next();
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isDeleted: user.isDeleted,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    next();
  }
};
