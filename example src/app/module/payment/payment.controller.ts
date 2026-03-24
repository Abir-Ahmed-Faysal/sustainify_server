/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express"
import { catchAsync } from "../../shared/catchAsync"
import { envVars } from "../../config/env"
import { StatusCodes } from "http-status-codes"
import { stripe } from "../../config/stripe.config"

import { sendRes } from "../../shared/sendRes"
import { PaymentService } from "./payment.service"


const handlerStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {


  const signature = req.headers['stripe-signature'] as string
  const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET as string

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


  try {
    const result = await PaymentService.handlerStripeWebhookEvent(event)

    sendRes(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "stripe webhook event processed successfully",
      data: result
    })
  } catch (error) {
    console.log("Error handling stripe webhook event", error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error handling stripe webhook event" })
  }
})



export const paymentController = { handlerStripeWebhookEvent }