/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interfaces";
import { zodErrorData } from "../errorHelpers/error.helper";
import AppError from "../errorHelpers/AppError";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";
import { deleteUploadedFilesFromGlobalErrorHandler } from "../utilities/deleteUploadedFilesFromGlobalErrorHandler";

import { handlePrismaClientInitializationError, handlePrismaClientKnownRequestError, handlePrismaClientRustPanicError, handlePrismaClientUnknownError, handlePrismaClientValidationError, } from "../errorHelpers/handlePrismaError";



// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const globalErrorHandler = async (err: any, req: Request, res: Response, _: NextFunction) => {


    if (envVars.NODE_ENV === "development") {
        console.log("Error form Global Error Handler", err);
    }

    await deleteUploadedFilesFromGlobalErrorHandler(req)



    let errorSources: TErrorSources[] = []
    let statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR
    let message: string = "internal Server error"
    let stack: string | undefined = undefined



    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const simplifiedError = handlePrismaClientKnownRequestError(err)

        statusCode = simplifiedError.statusCode as number;
        message = simplifiedError.message;
        errorSources = [...simplifiedError.errorSources]
        stack = err.stack
    } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        const simplifiedError = handlePrismaClientUnknownError(err)

        statusCode = simplifiedError.statusCode as number
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]

        stack = err.stack
    }
    else if (err in Prisma.PrismaClientValidationError) {

        const simplifiedError = handlePrismaClientValidationError(err)

        statusCode = simplifiedError.statusCode as number
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]

        stack = err.stack
    }
    else if (err instanceof Prisma.PrismaClientRustPanicError) {

        const simplifiedError = handlePrismaClientRustPanicError()

        statusCode = simplifiedError.statusCode as number
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]

        stack = err.stack
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
        const simplifiedError = handlePrismaClientInitializationError(err)


        statusCode = simplifiedError.statusCode as number
        message = simplifiedError.message
        errorSources = [...simplifiedError.errorSources]

        stack = err.stack
    }
    else if (err instanceof z.ZodError) {
        const zodError = zodErrorData(err)
        statusCode = zodError.statusCode
        message = zodError.message
        errorSources = [...zodError.errorSources]
        stack = err.stack
    } else if (err instanceof AppError) {
        message = err.message
        statusCode = err.statusCode;
        errorSources = [{
            path: "",
            message: err.message
        }];
        stack = err.stack


    } else if (err instanceof Error) {
        message = err.message;
        statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        errorSources = [{
            path: "",
            message: err.message
        }];
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