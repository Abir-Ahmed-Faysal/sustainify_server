import { NextFunction, Request, Response } from "express";

export const hitApi = async (req: Request, res: Response, next: NextFunction) => {
    console.log(`hit api form the ${req.originalUrl} `, req.body);
    next()
}