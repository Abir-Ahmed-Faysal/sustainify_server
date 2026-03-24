/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma";
import { cookieUtils } from "../utilities/cookie";
import { StatusCodes } from "http-status-codes";
import { jwtUtils } from "../utilities/jwt";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { prisma } from "../lib/prisma";
import { JwtPayload } from "jsonwebtoken";

export const checkAuth = (...roles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ----------------------------
      // 1️⃣ Access Token Verification
      // ----------------------------
      const accessToken = cookieUtils.getCookie(req, "accessToken");
      if (!accessToken) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "No access token provided");
      }

      const verifyAccessToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);

      if (!verifyAccessToken.success || !verifyAccessToken.data) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid access token");
      }

      const decoded = verifyAccessToken.data as JwtPayload;

      // ----------------------------
      // 2️⃣ Session + Refresh Token Verification
      // ----------------------------
      const refreshToken = cookieUtils.getCookie(req, "refreshToken");
      if (!refreshToken) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "No refresh token provided");
      }

      const session = await prisma.session.findFirst({
        where: {
          refreshToken,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });

      if (!session || !session.user) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Session expired or invalid");
      }

      const user = session.user;

      // Cross-check: access token user must match session user
      if (decoded.id !== user.id) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Token and session user mismatch");
      }

      // ----------------------------
      // 3️⃣ User Status Checks
      // ----------------------------
      if (!user.isActive) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "User is blocked");
      }

      if (user.isDeleted) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "User is deleted");
      }

      // ----------------------------
      // 4️⃣ Role Check
      // ----------------------------
      if (roles.length > 0 && !roles.includes(user.role)) {
        throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized to access this route");
      }

      // ----------------------------
      // 5️⃣ Optional: Refresh token lifetime warning
      // ----------------------------
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      const createdAt = new Date(session.createdAt);
      const refreshLifeTime = expiresAt.getTime() - createdAt.getTime();
      const timeRemaining = expiresAt.getTime() - now.getTime();
      const percentRemaining = (timeRemaining / refreshLifeTime) * 100;

      if (percentRemaining < 20) {
        res.setHeader("X-Session-Refresh", "true");
        res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
        res.setHeader("X-Time-Remaining", timeRemaining.toString());
      }

      // ----------------------------
      // 6️⃣ Attach user to request
      // ----------------------------
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
        next(error);
      } else {
        next(new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Unknown error"));
      }
    }
  };
};