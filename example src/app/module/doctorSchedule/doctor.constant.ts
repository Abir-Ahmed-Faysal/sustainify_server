import { Prisma } from "../../../generated/prisma/client";

export const doctorFilterableFields = ['id', 'doctorId', 'scheduleId'];


export const doctorSearchableFields = ['id', 'doctorId', 'scheduleId', 'createdAt', 'updatedAt', 'isBooked', 'schedule.endDateTime', 'schedule.startDateTime'];



export const doctorScheduleIncludeConfig: Partial<Record<keyof Prisma.DoctorScheduleInclude, Prisma.DoctorScheduleInclude[keyof Prisma.DoctorScheduleInclude]>> = {
    doctor: {
        include: {
            appointments: true,
            specialties: true
        }
    },
    schedule: true
}