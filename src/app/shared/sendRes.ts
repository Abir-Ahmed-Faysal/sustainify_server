import { Response } from "express";

interface IRequseResponseData<T> {
    statusCode: number;
    success: boolean;
    message: string;
    meta?: IMeta
    data?: T;
}
interface IMeta {
    total: number,
    page: number,
    limit: number,
    totalPages: number
}


export const sendResponse = <T>(res: Response, resPonseData: IRequseResponseData<T>) => {
    const { statusCode, message, success, data, meta } = resPonseData
    return res.status(statusCode).json({
        success,
        message,
        meta,
        data
    })
}