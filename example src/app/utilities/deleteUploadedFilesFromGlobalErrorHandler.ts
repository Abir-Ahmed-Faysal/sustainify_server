/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";

export const deleteUploadedFilesFromGlobalErrorHandler = async (req: Request) => {

    try {
        const filesToDelete: string[] = [];

        // single file
        if (req.file && req.file?.path) {
            filesToDelete.push(req.file.path);
        }

        // multer fields (object)
        else if (req.files && typeof req.files === "object" && !Array.isArray(req.files)) {

            Object.values(req.files).forEach((fileArray) => {
                if (Array.isArray(fileArray)) {
                    fileArray.forEach((file) => {
                        filesToDelete.push(file.path);
                    });
                }
            });

        }

        // multer array
        else if (req.files && Array.isArray(req.files) && req.files.length > 0) {

            req.files.forEach((file) => {
                filesToDelete.push(file.path);
            });

        }

        if (filesToDelete.length > 0) {
            await Promise.all(filesToDelete.map((url) => deleteFileFromCloudinary(url)));
        }

    } catch (error: any) {
        console.log("Error deleting uploaded files from the global handler", error);
    }

}