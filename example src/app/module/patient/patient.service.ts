import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
import { IUserRequest } from "../../interfaces/IUserRequest";
import { prisma } from "../../lib/prisma";
import { IUpdatePatientHealthDataPayload, IUpdatePatientProfilePayload } from "./patient.interface";
import { convertToDateTime } from "./patient.utils";


const updateMyProfile = async (user: IUserRequest, payload: IUpdatePatientProfilePayload) => {


  
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }, include: {
            patientHealthData: true,
            medicalReports: true,

        }
    })




    await prisma.$transaction(async (tx) => {

        if (payload.patientInfo) {
            await tx.patient.update({
                where: {
                    id: patientData.id
                }, data: {
                    ...payload.patientInfo
                }
            })
        }


        if (payload.patientInfo && (payload.patientInfo.name || payload.patientInfo.profilePhoto)) {
            const userData = {
                name: payload.patientInfo.name ? payload.patientInfo.name : patientData.name,
                image: payload.patientInfo.profilePhoto ? payload.patientInfo.profilePhoto : patientData.profilePhoto
            }

            await tx.user.update({
                where: {
                    email: patientData.email
                }, data: {
                    ...userData
                }
            })
        }

        if (payload.patientHealthData) {
            const healthDataToSave: IUpdatePatientHealthDataPayload = {
                ...payload.patientHealthData
            }

            // convert string -> Date
            if (payload.patientHealthData.dateOfBirth) {
                healthDataToSave.dateOfBirth = convertToDateTime(
                    typeof healthDataToSave.dateOfBirth === "string" ? healthDataToSave.dateOfBirth : undefined
                ) as Date;
            }


            // Prisma update
            await tx.patient_Health_Data.upsert({
                where: { patientId: patientData.id },
                update: healthDataToSave,
                create: {
                    patientId: patientData.id,
                    ...healthDataToSave
                }
            })
        }

        if (payload.medicalReports && Array.isArray(payload.medicalReports) && payload.medicalReports.length > 0) {

            for (const report of payload.medicalReports) {

                if (report.shouldDelete && report.reportId) {
                    const deletedReport = await tx.medicalReport.delete({
                        where: {
                            id: report.reportId
                        }
                    })

                    if (deletedReport.reportLink) {
                        await deleteFileFromCloudinary(deletedReport.reportLink)
                    }


                } else if (report.reportName && report.reportLink) {
                    await tx.medicalReport.create({
                        data: {
                            reportName: report.reportName,
                            reportLink: report.reportLink,
                            patientId: patientData.id
                        }
                    })
                }
            }
        }
    })


    const patient = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }, include: {
            patientHealthData: true,
            medicalReports: true,
        }
    })


    return patient
}



export const patientService = {
    updateMyProfile
}