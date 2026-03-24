import z from "zod";

const createPrescriptionValidationZodSchema = z.object({
    appointmentId: z.string("appointmentId is required"),
    instructors: z.string("instructors is required").min(1, "instructors is required"),
    followUpDate: z.string("followUpDate is required")
})


const updatePrescriptionValidationZodSchema = z.object({

    instructors: z.string("instructors is required").min(1, "instructors is required").optional(),
    followUpDate: z.string("followUpDate is required").optional()
})

export const PrescriptionValidation = {
    createPrescriptionValidationZodSchema,
    updatePrescriptionValidationZodSchema
}