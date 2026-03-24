import z from "zod";



export const createDoctorScheduleValidationSchema = z.object({
    scheduleIds: z
        .array(
            z.string("Each scheduleId must be a valid UUID")
        )
        .min(1, "At least one scheduleId is required"),
});


export const updateDoctorScheduleSchema = z.object({
    scheduleIds: z
        .array(
            z.object({
                id: z.string("Invalid schedule ID"),
                shouldDelete: z.boolean(),
            })
        )
        .min(1, "At least one scheduleId is required"),
});