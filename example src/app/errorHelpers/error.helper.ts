import z from "zod";
import { TErrorSources } from "../interfaces/error.interfaces";
import { StatusCodes } from "http-status-codes";





export const  zodErrorData = (err: z.ZodError) => {
    
   const statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR
    const message: string = "internal Server error"
    const  errorSources: TErrorSources[] = []



    err.issues.forEach((issue) => {
        errorSources.push({
            path: issue.path.length > 1 ? issue.path.join(" ") : issue.path[0].toString(),
            message: issue.message
        })
    })


return { statusCode, message, errorSources }



}