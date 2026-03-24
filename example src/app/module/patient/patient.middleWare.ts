import { NextFunction, Request, Response } from "express";
import { IUpdateMedicalReport, IUpdatePatientInfoPayload, IUpdatePatientProfilePayload } from "./patient.interface";

export const transformPatientPayload = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const payload: IUpdatePatientProfilePayload = JSON.parse(req.body.data)

    const files = req.files as { [fieldName: string]: Express.Multer.File[] }

    if (files?.profilePhoto?.[0]) {
        if (!payload.patientInfo) {
            payload.patientInfo = {} as IUpdatePatientInfoPayload
        }

        payload.patientInfo.profilePhoto = files.profilePhoto[0].path
    }

    if (files?.medicalReports?.length) {

        const newReports = files.medicalReports.map(file => ({
            reportName: file.originalname,
            reportLink: file.path
        }))

        if (payload.medicalReports) {
            payload.medicalReports = [...payload.medicalReports, ...newReports] as IUpdateMedicalReport[]
        } else {
            payload.medicalReports = newReports as IUpdateMedicalReport[]
        }
    }

    req.body = payload

    next()
}


