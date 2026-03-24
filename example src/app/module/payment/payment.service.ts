/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { generateInvoice } from "./generateInvoice";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { sendEmail } from "../../utilities/email";

const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
  console.log(`[Stripe Webhook] Event: ${event.type} | ${event.id}`);

  // 1️⃣ Prevent duplicate processing (idempotency)
  const existingPayment = await prisma.payment.findFirst({
    where: { stripeEventId: event.id },
  });

  if (existingPayment) {
    console.log(`Event ${event.id} already processed`);
    return { message: "Event already processed" };
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const appointmentId = session.metadata?.appointmentId;
        const paymentId = session.metadata?.paymentId;

        if (!appointmentId || !paymentId) {
          console.error("Missing metadata");
          return { message: "Invalid metadata" };
        }

        // 2️⃣ Fetch appointment
        const appointment = await prisma.appointment.findUnique({
          where: { id: appointmentId },
          include: {
            patient: true,
            doctor: true,
            schedule: true,
            payment: true,
          },
        });

        if (!appointment) {
          console.error("Appointment not found");
          return { message: "Appointment not found" };
        }

        const paymentStatus =
          session.payment_status === "paid"
            ? PaymentStatus.PAID
            : PaymentStatus.UNPAID;

        // 3️⃣ FAST TRANSACTION (DB only)
        const result = await prisma.$transaction(async (tx) => {
          const updatedAppointment = await tx.appointment.update({
            where: { id: appointmentId },
            data: {status: paymentStatus },
            include: {
              patient: true,
              doctor: true,
              schedule: true,
              payment: true,
            },
          });

          const updatedPayment = await tx.payment.update({
            where: { id: paymentId },
            data: {
              stripeEventId: event.id,
              status: paymentStatus,
              paymentGatewayData: session as any,
            },
          });

          return { updatedAppointment, updatedPayment };
        });

        // 4️ Generate invoice (OUTSIDE transaction)
        let pdfBuffer: Buffer | null = null;
        let invoiceUrl: string | null = null;

        if (session.payment_status === "paid") {
          try {
            pdfBuffer = await generateInvoice({
              invoiceId: result.updatedPayment.id,
              patientName: result.updatedAppointment.patient.name,
              patientEmail: result.updatedAppointment.patient.email,
              doctorName: result.updatedAppointment.doctor.name,
              doctorEmail: result.updatedAppointment.doctor.email,
              scheduleDate:
                result.updatedAppointment.schedule?.startDateTime?.toISOString() ??
                "",
              amount: String(result.updatedPayment.amount || 0),
              transactionId: result.updatedPayment.transitionId || "",
              status: paymentStatus,
              paymentDate: new Date().toISOString(),
            });

            // Upload to cloudinary
            const cloudinaryResponse = await uploadFileToCloudinary(
              pdfBuffer,
              `invoice-${result.updatedPayment.id}-${Date.now()}.pdf`
            );

            if (cloudinaryResponse?.secure_url) {
              invoiceUrl = cloudinaryResponse.secure_url;

              // save invoice url
              await prisma.payment.update({
                where: { id: paymentId },
                data: { invoiceUrl },
              });
            }
          } catch (error) {
            console.error("Invoice generation failed:", error);
          }
        }

        // 5️⃣ Send email
        if (pdfBuffer && invoiceUrl) {
          try {
            await sendEmail({
              to: result.updatedAppointment.patient.email,
              subject: `Invoice for Appointment ${appointmentId}`,
              templateName: "invoice",
              templateData: {
                invoiceId: result.updatedPayment.id,
                transactionId: result.updatedPayment.transitionId || "",
                doctorName: result.updatedAppointment.doctor.name,
                patientName: result.updatedAppointment.patient.name,
                appointmentDate:
                  result.updatedAppointment.schedule?.startDateTime
                    ? new Date(
                        result.updatedAppointment.schedule.startDateTime
                      ).toLocaleDateString()
                    : "N/A",
                amount: String(result.updatedPayment.amount || 0),
                invoiceUrl,
              },
              attachments: [
                {
                  filename: `invoice-${result.updatedPayment.id}.pdf`,
                  content: pdfBuffer,
                  contentType: "application/pdf",
                },
              ],
            });
          } catch (error) {
            console.error("Email sending failed:", error);
          }
        }

        console.log(
          `Checkout session completed for appointment ${appointmentId}`
        );

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
  handlerStripeWebhookEvent,
};



















/*
Stripe Webhook
   │
   ▼
Check duplicate event
   │
   ▼
Transaction (ONLY DB)
   ├ update appointment
   └ update payment
   │
   ▼
Generate invoice
   │
   ▼
Upload cloudinary
   │
   ▼
Update payment.invoiceUrl
   │
   ▼
Send email
*/ 