import { Prisma } from "../../../generated/prisma/client";

export const scheduleSearchableFields = ['id', 'startDateTime', 'endDateTime'];

export const scheduleFilterableFields = ['id', 'startDateTime', 'endDateTime'];


export const scheduleIncludeConfig: Partial<Record<keyof Prisma.ScheduleInclude, Prisma.ScheduleInclude[keyof Prisma.ScheduleInclude]>> = {
    appointments: {
        include: {
            patient: true,
            doctor: true,
            payment: true,
            prescriptions: true,
            review: true
        }
    }, 
    doctorSchedules: true

}

