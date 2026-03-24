import { Prisma } from "../../../generated/prisma/client"

export const appointmentFilterableFields = ["searchTerm", "status"]
export const appointmentSearchableFields = ["patientId", "doctorId"]


export const appointmentIncludeConfig: Partial<Record<keyof Prisma.AppointmentInclude, Prisma.AppointmentInclude[keyof Prisma.AppointmentInclude]>> = {
    payment: true,
    schedule: true
}