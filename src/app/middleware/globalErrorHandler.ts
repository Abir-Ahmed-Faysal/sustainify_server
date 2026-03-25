/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import z from "zod";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interfaces";
import { zodErrorData } from "../errorHelpers/error.helper";
import AppError from "../errorHelpers/AppError";
import { deleteUploadedFilesFromGlobalErrorHandler } from "../utilities/deleteUploadedFilesFromGlobalErrorHandler";
// import { Prisma } from "@prisma/client";
// import {
//     handlePrismaClientInitializationError,
//     handlePrismaClientKnownRequestError,
//     handlePrismaClientRustPanicError,
//     handlePrismaClientUnknownError,
//     handlePrismaClientValidationError,
// } from "../errorHelpers/handlePrismaError";

export const globalErrorHandler = async (err: any, req: Request, res: Response, _: NextFunction) => {
    await deleteUploadedFilesFromGlobalErrorHandler(req);

    if (envVars.NODE_ENV === "development") {
        console.log("Error from Global Error Handler", err);
    }

    let errorSources: TErrorSources[] = []
    let statusCode: number = 500;
    let message: string = "Internal Server Error"
    let stack: string | undefined = undefined

    // Uncomment Prisma error handling when Prisma Client is generated
    /*
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const simplifiedError = handlePrismaClientKnownRequestError(err)
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources = [...simplifiedError.errorSources]
        stack = err.stack
    } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        const simplifiedError = handlePrismaClientUnknownError(err)
        statusCode = simplifiedError.statusCode
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]
        stack = err.stack
    } else if (err instanceof Prisma.PrismaClientValidationError) {
        const simplifiedError = handlePrismaClientValidationError(err)
        statusCode = simplifiedError.statusCode
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]
        stack = err.stack
    } else if (err instanceof Prisma.PrismaClientRustPanicError) {
        const simplifiedError = handlePrismaClientRustPanicError()
        statusCode = simplifiedError.statusCode
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]
        stack = err.stack
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        const simplifiedError = handlePrismaClientInitializationError(err)
        statusCode = simplifiedError.statusCode
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]
        stack = err.stack
    } else
    */

    if (err instanceof z.ZodError) {
        const zodError = zodErrorData(err)
        statusCode = zodError.statusCode
        message = zodError.message
        errorSources = [...zodError.errorSources]
        stack = err.stack
    } else if (err instanceof AppError) {
        message = err.message
        statusCode = err.statusCode;
        errorSources = [{ path: "", message: err.message }];
        stack = err.stack
    } else if (err instanceof Error) {
        message = err.message;
        statusCode = 500;
        errorSources = [{ path: "", message: err.message }];
        stack = err.stack
    }

    const errorObject: TErrorResponse = {
        success: false,
        message,
        errorSources,
        stack: envVars.NODE_ENV === "development" ? err.stack : undefined,
        error: envVars.NODE_ENV === "development" ? err : undefined,
    }

    res.status(statusCode).json(errorObject)
}
