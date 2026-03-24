import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";
import { tokenUtils } from "../../utilities/token";
import { IUserRequest } from "../../interfaces/user.interface";


const register = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);

    const { accessToken, refreshToken, ...rest } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);

    return sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "User registered successfully",
        data: { accessToken, refreshToken, ...rest }
    });
});

const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    const { accessToken, refreshToken, ...rest } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Login successfully",
        data: { accessToken, refreshToken, ...rest }
    });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IUserRequest
    const result = await authService.getMe(user);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "User data retrieved successfully",
        data: result
    });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        return sendResponse(res, {
            statusCode: StatusCodes.UNAUTHORIZED,
            success: false,
            message: "Refresh token is missing",
        });
    }

    const result = await authService.refreshTokenHandler(token);

    const { accessToken, refreshToken: newRefreshToken } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, newRefreshToken);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Token refreshed successfully",
        data: { accessToken, refreshToken: newRefreshToken }
    });
});

export const authController = {
    register,
    login,
    getMe,
    refreshToken,
};