import z from "zod"

export const createAppointmentPayload = z.object({
    doctorId: z.string('doctorId is required'),
    scheduleId: z.string('doctorId is required'),
})


export const updateAppointmentPayload = z.object({
    doctorId: z.string('doctorId is required'),
    scheduleId: z.string('scheduleId is required'),
    status: z.string('status is required'),
})