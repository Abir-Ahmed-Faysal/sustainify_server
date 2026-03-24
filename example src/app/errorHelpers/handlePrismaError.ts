/* eslint-disable prefer-const */
import { StatusCodes } from "http-status-codes"
import { Prisma } from "../../generated/prisma/client"
import { TErrorResponse, TErrorSources } from "../interfaces/error.interfaces"



const getStatusCodeFromPrismaError = (errorCode: string): number => {

    // P2002: unique constraint failed
    if (errorCode === "P2002") {
        return StatusCodes.CONFLICT
    }

    //  P2025, P2001, P2015, P2018: not found
    if (['P2025', 'P2001', 'P2015', 'P2018'].includes(errorCode)) {
        return StatusCodes.NOT_FOUND
    }

    // P1000,P6002 : DB Authentication errors
    if (['P1000', 'P6002'].includes(errorCode)) {
        return StatusCodes.UNAUTHORIZED
    }

    // P1010,P6010 :Access denied errors
    if (['P1010', 'P6010'].includes(errorCode)) {
        return StatusCodes.FORBIDDEN
    }

    // prisma accelerate plan reached limit for data caching
    if (errorCode === 'P6003') {
        return StatusCodes.PAYMENT_REQUIRED
    }

    // P1008, P2004, P6004 : Timeout error
    if (['P1008', 'P2004', 'P6004'].includes(errorCode)) {
        return StatusCodes.GATEWAY_TIMEOUT
    }

    //  P5011 : Rate limit exceeded
    if (errorCode === 'P5011') {
        return StatusCodes.TOO_MANY_REQUESTS
    }

    // P6009 : Response size limit exceeded
    if (errorCode === 'P6009') {
        return 413
    }

    // P1xxx, P2024, P2037, P6008 : connection errors
    if (errorCode.startsWith('P1') || ['P2024', 'P2037', 'P6008'].includes(errorCode)) {
        return StatusCodes.SERVICE_UNAVAILABLE
    }

    // P2xxx : except unhandled error
    if (errorCode.startsWith('P2')) {
        return StatusCodes.BAD_REQUEST
    }

    // P3xxx ,P4xxx :internal server errors
    if (errorCode.startsWith('P3') || errorCode.startsWith('P4')) {
        return StatusCodes.INTERNAL_SERVER_ERROR
    }

    return StatusCodes.INTERNAL_SERVER_ERROR
}




const formatErrorMeta = (meta?: Record<string, unknown>): string => {
    if (!meta) return ""

    const parts: string[] = []

    if (meta.target) {
        parts.push(`Field(s): ${String(meta.target)}`)
    }

    if (meta.field_name) {
        parts.push(`Field: ${String(meta.field_name)}`)
    }

    if (meta.column_name) {
        parts.push(`Column: ${String(meta.column_name)}`)
    }

    if (meta.table) {
        parts.push(`Table: ${String(meta.table)}`)
    }

    if (meta.model_name) {
        parts.push(`Model: ${String(meta.model_name)}`)
    }

    if (meta.constraint) {
        parts.push(`Constraint: ${String(meta.constraint)}`)
    }

    if (meta.database_error) {
        parts.push(`Database error: ${String(meta.database_error)}`)
    }

    return parts.length > 0 ? parts.join(", ") : ""
}



export const handlePrismaClientKnownRequestError = (error: Prisma.PrismaClientKnownRequestError): TErrorResponse => {
    const statusCode = getStatusCodeFromPrismaError(error.code)

    const metaInfo = formatErrorMeta(error.meta)



    let cleanMessage = error.message

    // Remove the "invalid `prisma.user.create() invocation:` " part form the message better readability

    cleanMessage = cleanMessage.replace(/invalid `.*?` invocation:?\s*/i, '')

    // split by new line and take the first line as the main message, rest can be added to error sources 

    const lines = cleanMessage.split('\n').filter(line => line.trim())

    const mainMessage = lines[0] || "An error occurred with the database operation"



    const errorSources: TErrorSources[] = [

        {
            path: error.code,
            message: metaInfo ? `${mainMessage} | (${metaInfo})` : mainMessage
        }]

    if (error.meta?.cause) {
        errorSources.push({
            path: "cause",
            message: String(error.meta.cause)
        })
    }



    return {
        statusCode,
        message: `prisma client known request error : ${mainMessage}`,
        errorSources,
        success: false,
    }


}




export const handlePrismaClientUnknownError = (error: Prisma.PrismaClientUnknownRequestError): TErrorResponse => {
    let cleanMessage = error.message

    cleanMessage = cleanMessage.replace(/invalid `.*?` invocation:?\s*/i, '')

    const lines = cleanMessage.split('\n').filter(line => line.trim())

    const mainMessage = lines[0] || `an error occurred on database operation`

    const errorSources: TErrorSources[] = [


        {
            path: "unknown Prisma Error",
            message: mainMessage
        }
    ]


    return {
        success: false,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Prisma client unknown Request Error: ${mainMessage}`,
        errorSources
    }


}



export const handlePrismaClientValidationError = (
    error: Prisma.PrismaClientValidationError
): TErrorResponse => {
    // ১. Clean the error message: remove newlines, Prisma invocation noise, and split on → if present
    let cleanMessage = error.message
        .replace(/\n/g, " ")
        .replace(/Invalid `.*?` invocation:?\s*/i, "")
        .split("→")[0]
        .trim();

    // ২. Extract the field name if present
    const fieldMatch = error.message.match(
        /Argument `(\w+)`|Unknown arg `(\w+)`|Field `(\w+)`/
    );
    const fieldName = fieldMatch ? (fieldMatch[1] || fieldMatch[2] || fieldMatch[3]) : "path";

    // ৩. Simplify the message for readability
    const simplifiedMessage = cleanMessage
        .replace(/Argument `\w+` /g, "")
        .split(".")[0] // take only the first sentence
        .trim();

    const errorSources: TErrorSources[] = [
        {
            path: fieldName,
            message: simplifiedMessage || "Validation failed in database operation",
        },
    ];

    return {
        success: false,
        statusCode: StatusCodes.BAD_REQUEST,
        message: "Prisma Client Validation Error",
        errorSources,
    };
};


export const handlePrismaClientInitializationError = (error: Prisma.PrismaClientInitializationError): TErrorResponse => {

    const statusCode = error.errorCode ? getStatusCodeFromPrismaError(error.errorCode) : StatusCodes.SERVICE_UNAVAILABLE

    const cleanMessage = error.message;
    cleanMessage.replace(/invalid `.*?` invocation:?\s*/i, '')


    const lines = cleanMessage.split('\n').filter(line => line.trim())


    const mainMessage = lines[0] || "An error occurred while initializing the prisma client."

    const errorSources: TErrorSources[] = [
        {
            path: error.errorCode || "initialization error",
            message: mainMessage,

        }
    ]


    return {
        success: false,
        statusCode,
        message: `prisma Client initialization Error: ${mainMessage}`,
        errorSources
    }
}



export const handlePrismaClientRustPanicError = (): TErrorResponse => {

    const errorSources: TErrorSources[] = [{
        path: "Rust Engine Crashed",
        message: "The database engine encountered a fatal error and crashed. This is usually due to an internal bug in the prisma engine or an unexpected edge case in the  database operation. Please check the  prisma logs for more details and consider reporting this issue to the prisma team if it persists"


    }]


    return {
        success: false,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: `Prisma client Rust panic Error: The database engine crashed errorSources`,
        errorSources
    }

}