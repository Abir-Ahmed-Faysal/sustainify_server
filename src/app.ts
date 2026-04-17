import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { indexRoutes } from "./app/routes/index.js";
import { paymentController } from "./app/modules/payment/payment.controller";
import qs from "qs";
import { requestLogger } from "./app/middleware/requestLogger";


const app: Application = express();

app.set("query parser", (str: string) => qs.parse(str))

// Stripe webhook endpoint (raw body required for signature verification)
app.post('/webhook', express.raw({
    type: "application/json"
}), paymentController.stripeWebhook)


// Also expose webhook under API prefix for production setups using /api/v1/payment/webhook
app.post('/api/v1/payment/webhook', express.raw({
    type: "application/json"
}), paymentController.stripeWebhook)    

const corsOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL || 'https://sustainify-frontend.vercel.app']
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(requestLogger)
// Routes
app.use("/api/v1", indexRoutes)

// Health Check
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: "🚀 Sustainify API is running!" });
});

// Error Handlers
app.use(globalErrorHandler)
app.use(notFound)


// Start Newsletter Cron (every 15 minutes)


export default app;
