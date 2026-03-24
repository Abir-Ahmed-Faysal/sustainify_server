import { Response } from "express";

interface IResponseData<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data?: T;
    meta?:{
        total:number,
        page:number, 
        limit:number,
        totalPages:number
        
    }
}


export const sendRes = <T>(res: Response, responseData: IResponseData<T>) => {
    const { statusCode, success, message, data,meta } = responseData

    return res.status(statusCode).json({ success, message, data ,meta})
}
