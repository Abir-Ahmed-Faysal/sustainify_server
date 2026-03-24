import z from "zod";
import { BloodGroup, Gender } from "../../../generated/prisma/enums";

/*
interfaces...
*/

const updatePatientProfileZodSchema = z.object({
    patientInfo: z.object({
        name: z.string().min(3, "name must be at least 3 characters long"),
        profilePhoto: z.url("profile photo must be a valid url").optional(),
        address: z.string().optional(),
        contactNumber: z
            .string()
            .min(11, "contact number must be at least 11 characters long")
            .max(14, "contact number must be at most 14 characters long")
            .optional(),
    }).optional(),

 patientHealthData: z.object({
    height: z.string().optional(),
    weight: z.string().optional(),

    bloodPressure: z.string().optional(),
    bloodSugar: z.string().optional(),

    dateOfBirth: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), "date of birth must be a valid date")
        .optional(),

    gender: z.enum(Gender).optional(),

    bloodGroup: z.enum([
        BloodGroup.A_POSITIVE,
        BloodGroup.A_NEGATIVE,
        BloodGroup.B_POSITIVE,
        BloodGroup.B_NEGATIVE,
        BloodGroup.O_POSITIVE,
        BloodGroup.O_NEGATIVE,
        BloodGroup.AB_POSITIVE,
        BloodGroup.AB_NEGATIVE,
    ]).optional(),

    hasAllergies: z.boolean().optional(),
    hasDiabetes: z.boolean().optional(),
    smokingStatus: z.boolean().optional(),
    recentAnxiety: z.string().optional(),
    recentDepression: z.string().optional(),
    hasPastSurgery: z.boolean().optional(),
    pregnancyStatus: z.boolean().optional(),
    maritalStatus: z.boolean().optional(),

}).optional(),

    medicalReports: z
        .array(
            z.object({
                reportName: z
                    .string()
                    .min(3, "report name must be at least 3 characters long")
                    .optional(),
                reportLink: z
                    .url("report link must be a valid URL")
                    .optional(),
                shouldDelete: z.boolean().optional(),
                reportId: z.uuid("report id must be a valid uuid").optional(),
            })
        )
        .optional().refine((reports) => {
            if (!reports || reports.length === 0) return true

            for (const report of reports) {
                // case 1  
                if (report.shouldDelete && !report.reportId) {
                    return false
                }
                // case 2
                if (report.reportId && !report.shouldDelete) { return false }
                // case 3
                if (report.reportName && !report.reportLink) { return false }
                // case 4
                if (report.reportLink && !report.reportName) { return false }
            }
            return true
        }, { message: "invalid report data" }),
});

export const patientValidation = {
    updatePatientProfileZodSchema,
};


// const da= {
//   "patientInfo": {
//     "name": "John Doe",
//     "contactNumber": "01712345678",
//         "address": "Dhaka, Bangladesh",
//     "profilePhoto": "https://example.com/images/patients/john-doe.jpg"
//   },
//   "patientHealthData": {
//     "height": "175",
//     "weight": "72",
//     "bloodPressure": "120/80",
//     "allergies": "Peanuts",
//     "dateOfBirth": "1995-06-15",
//     "bloodGroup": "O_POSITIVE",
//     "currentMedications": "None",
//     "medicalHistory": "No chronic conditions"
//   }
// }