import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createScheduleValidation = z.object({
    startDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid date format",
        }),

    endDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid date format",
        }),

    startTime: z
        .string()
        .regex(timeRegex, { message: "Invalid time format (HH:mm)" }),

    endTime: z
        .string()
        .regex(timeRegex, { message: "Invalid time format (HH:mm)" }),
});


export const updateScheduleValidation = z.object({
    startDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid date format",
        }),

    endDate: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid date format",
        }),

    startTime: z
        .string()
        .regex(timeRegex, { message: "Invalid time format (HH:mm)" }),

    endTime: z
        .string()
        .regex(timeRegex, { message: "Invalid time format (HH:mm)" }),
});





export type IUpdateSchedulePayload = z.infer<typeof updateScheduleValidation>