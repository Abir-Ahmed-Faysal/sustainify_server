/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application } from "express";
import { indexRoutes } from "./app/routes";
import { notFound } from "./app/middleware/notFoud";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import auth from "./app/lib/auth";
import path from "node:path";
import cors from 'cors';
import { envVars } from "./app/config/env";
import qs from 'qs';
import { paymentController } from "./app/module/payment/payment.controller";
import cron from 'node-cron';
import { AppointmentService } from "./app/module/appointment/appointment.service";


const app: Application = express();
// The port your express server will be running on.


app.set("query parser", (str: string) => qs.parse(str))
app.set("view engine", "ejs")
app.set("views", path.resolve(process.cwd(), `src/app/templates`))

app.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handlerStripeWebhookEvent)

app.use(cors({
    origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))



app.use("/api/auth", toNodeHandler(auth))

// Enable URL-encoded form data parsing

// Middleware to parse JSON bodies
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


cron.schedule(" */25 * * * * ", async () => {
    try {
        AppointmentService.cancelUnpaidAppointment()
        
        console.log("Running cron job to  cancel unpaid appointments ..");
    } catch (error: any) {
        console.log("error occurred while cancelling unpaid appointments", error)
    }
})

app.use("/api/v1", indexRoutes)


app.use(globalErrorHandler)



app.use(notFound)


export default app