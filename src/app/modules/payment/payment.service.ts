import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus, IdeaStatus } from "../../../generated/prisma";
import AppError from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { IUserRequest } from "../../interfaces/user.interface";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";
import { uuidv7 } from 'uuidv7'

const createCheckoutSession = async (user: IUserRequest, ideaId: string) => {
    const idea = await prisma.idea.findUnique({
        where: { 
            id: ideaId,
            status: IdeaStatus.APPROVED,
            isDeleted: false
        },
    });

    if (!idea) {
        throw new AppError(StatusCodes.NOT_FOUND, "Idea not found or not approved");
    }

    if (!idea.isPaid || !idea.price) {
        throw new AppError(StatusCodes.BAD_REQUEST, "This idea is not a paid idea or has no price");
    }

    // Check if user already has access
    const existingAccess = await prisma.access.findFirst({
        where: {
            userId: user.id,
            ideaId: ideaId,
        },
    });

    // if (existingAccess || idea.authorId === user.id) {
    //     throw new AppError(StatusCodes.BAD_REQUEST, "You already have access to this idea");
    // }

    const transactionId = String(uuidv7())

    // Create pending payment record
    const payment = await prisma.payment.create({
        data: {
            userId: user.id,
            ideaId: ideaId,
            amount: idea.price,
            transactionId,
        },
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer_email: user.email,
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: idea.title,
                        description: "Access to premium sustainability idea: " + idea.title,
                    },
                    unit_amount: Math.round(idea.price * 100),
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${envVars.FRONTEND_URL}/ideas/${ideaId}?success=true`,
        cancel_url: `${envVars.FRONTEND_URL}/ideas/${ideaId}?canceled=true`,
        metadata: {
            ideaId: ideaId,
            paymentId: payment.id,
            userId: user.id,
        },
    });

    return { sessionUrl: session.url };
};

const StripeWebhookEventHandler = async (event: Stripe.Event) => {
    console.log(`[stripe Webhook] Event: ${event.type} | ${event.id}`);

    // Prevent duplicate processing
    const existingPayment = await prisma.payment.findFirst({
        where: { stripeEventId: event.id },
    });

    if (existingPayment) {
        console.log(`[Stripe Webhook] Event ${event.id} already processed`);
        return { message: "Event already processed" };
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;

                const ideaId = session.metadata?.ideaId;
                const paymentId = session.metadata?.paymentId;
                const userId = session.metadata?.userId;

                if (!ideaId || !paymentId || !userId) {
                    console.log("Missing metadata");
                    return { message: "Invalid metadata" };
                }

                const paymentStatus =
                    session.payment_status === "paid"
                        ? PaymentStatus.PAID
                        : PaymentStatus.UNPAID;

                if (paymentStatus === PaymentStatus.PAID) {
                    await prisma.$transaction(async (tx) => {
                        // Check if access already exists just in case
                        const existingAccess = await tx.access.findFirst({
                            where: {
                                userId,
                                ideaId,
                            },
                        });

                        if (!existingAccess) {
                            await tx.access.create({
                                data: {
                                    userId,
                                    ideaId,
                                },
                            });
                        }

                        // Update Payment
                        await tx.payment.update({
                            where: { id: paymentId },
                            data: {
                                status: PaymentStatus.PAID,
                                stripeEventId: event.id,
                                paymentGatewayData: session as any,
                            },
                        });
                    });
                    console.log(
                        `Payment successful and access granted for idea ${ideaId} to user ${userId}`
                    );
                } else {
                    // Update Payment to unpaid/failed if it wasn't paid
                    await prisma.payment.update({
                        where: { id: paymentId },
                        data: {
                            status: paymentStatus,
                            stripeEventId: event.id,
                            paymentGatewayData: session as any,
                        },
                    });
                }

                break;
            }

            case "checkout.session.expired": {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log(`Checkout session expired: ${session.id}`);
                break;
            }

            case "payment_intent.payment_failed": {
                const intent = event.data.object as Stripe.PaymentIntent;
                console.log(`Payment failed: ${intent.id}`);
                break;
            }

            default:
                console.log(`Unhandled event: ${event.type}`);
        }

        return { message: "Webhook processed successfully" };
    } catch (error) {
        console.error("Stripe webhook error:", error);
        return { message: "Internal server error" };
    }
};

export const PaymentService = {
    createCheckoutSession,
    StripeWebhookEventHandler,
};