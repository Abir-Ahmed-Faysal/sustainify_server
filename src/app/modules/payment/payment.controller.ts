import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendRes";
import { StatusCodes } from "http-status-codes";
import { PaymentService } from "./payment.service";
import { IUserRequest } from "../../interfaces/user.interface";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as IUserRequest;
    const { ideaId } = req.body;
    console.log("ideaId", ideaId)
    const result = await PaymentService.createCheckoutSession(user, ideaId);

    return sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Checkout session created successfully",
        data: result,
    });
});


const stripeWebhook = catchAsync(async (req: Request, res: Response) => {

    
    const signature = req.headers['stripe-signature'] as string
    const webhookSecret = envVars.STRIPE_WEBHOOK_SECRET as string

    if (!signature || !webhookSecret) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Missing stripe signature or webhook secret" })
    }


    let event

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret)
    } catch (error: any) {
        console.log(`Error processing webhook event: ${error}`);
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Error processing stripe webhook event" })
    }



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