import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";
import { PaymentService } from "./payment.service";
import { IUserRequest } from "../../interfaces/user.interface";

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IUserRequest;
    const { ideaId } = req.body;

    const result = await PaymentService.createCheckoutSession(user, ideaId);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Checkout session created successfully",
        data: result,
    });
});

const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
    // Stripe CLI / API sends the event in the body
    const event = req.body;

    const result = await PaymentService.StripeWebhookEventHandler(event);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Webhook processed successfully",
        data: result,
    });
});

export const paymentController = {
    createCheckoutSession,
    stripeWebhook,
};