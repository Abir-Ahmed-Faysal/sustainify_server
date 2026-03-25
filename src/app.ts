import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { indexRoutes } from "./app/routes";
import { paymentController } from "./app/modules/payment/payment.controller";

const app: Application = express();

app.post('/webhook', express.raw({
    type: "application/json"
}),paymentController.stripeWebhook)

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/api/v1", indexRoutes)

// Health Check
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: "🚀 Sustainify API is running!" });
});

// Error Handlers
app.use(globalErrorHandler)
app.use(notFound)

export default app;
