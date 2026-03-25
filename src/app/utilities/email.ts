import nodemailer from 'nodemailer'
import { envVars } from '../config/env'
import path from 'node:path'
import ejs from "ejs";
import { StatusCodes } from 'http-status-codes';
import AppError from '../errorHelpers/AppError';


const transporter = nodemailer.createTransport({
    host: envVars.EMAIL_SENDER_SMTP_HOST,
    secure: true,

    auth: {
        user: envVars.EMAIL_SENDER_SMTP_USER,
        pass: envVars.EMAIL_SENDER_SMTP_PASS,
    },

    port: Number(envVars.EMAIL_SENDER_SMTP_PORT),
})



interface sendEmailOptions {
    to: string,
    subject: string,
    templateName: string,
    templateData: Record<string, any>,
    attachments?: {
        filename: string,
        content: Buffer | string,
        contentType: string
    }[]
}


export const sendEmail = async (
    {
        to,
        subject,
        templateName,
        templateData,
        attachments
    }: sendEmailOptions
) => {

    try {

        const templatePath = path.resolve(process.cwd(), `src/app/templates/${templateName}.ejs`)

        console.log("Template Path:", templatePath)

        const html = await ejs.renderFile(templatePath, templateData)

        const info = await transporter.sendMail({
            from: envVars.EMAIL_SENDER_SMTP_FROM,
            to,
            subject,
            html,
            attachments: attachments?.map(attachment => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType
            }))
        })




        console.log(`emal send to ${to} : ${info.messageId}`)

    } catch (error: any) {
        console.log("email server error", error)
        throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "email sending error")
    }


}