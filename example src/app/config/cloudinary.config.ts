/* eslint-disable no-useless-escape */
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env";
import AppError from "../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";



cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});



export const uploadFileToCloudinary = async (
  buffer: Buffer,
  fileName: string
): Promise<UploadApiResponse> => {
  if (!buffer || !fileName) {
    throw new AppError(StatusCodes.BAD_REQUEST, "File buffer or file name is missing");
  }

  // Extract file extension
  const extension = fileName.split(".").pop()?.toLowerCase();

    const filenameWithoutExtension = fileName
      .split(".")
      .slice(0, -1)
      .join(".")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

    const uniqueName =
      Math.random().toString(36).substring(2, 9) +
      "-" +
      Date.now() +
      "-" +
      filenameWithoutExtension;

    const folder = extension === "pdf" ? "pdfs" : "images";

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `healthcare/${folder}`,
        public_id: uniqueName,
        resource_type: "auto", // handles images, pdfs, and other files
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(
            new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to upload file to Cloudinary")
          );
        }
        resolve(result as UploadApiResponse);
      }
    ).end(buffer);
  });
};



// const multifileUpload= async()=>{

// }






//  url = "https://res.cloudinary.com/demo/image/upload/v1699999999/folder/my-image.png";
export const deleteFileFromCloudinary = async (url: string) => {
  try {

    //  take the extention
    // const extension = url.split(".").pop()?.toLocaleLowerCase()

    //check if the type include the taking 3 category

    //  take unique part form the cloudinary url 

    const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;

    const match = url.match(regex)
    /*
  [
    "/v1699999999/folder/my-image.png", // Full matched part
    "folder/my-image"                  // Captured group (publicId)
  ]
  */

    if (match && match[1]) {
      const publicId = match[1]
      await cloudinary.uploader.destroy(
        publicId, {
        resource_type: "image",       // cloudinary make the all file as image except video or we can take the extension form the url dynamic
      }
      );
      console.log(`file ${publicId} deleted from cloudinary successfully`);
    }

  } catch (error) {
    console.log(error);
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to delete file from cloudinary")
  }


}





export const cloudinaryUpload = cloudinary