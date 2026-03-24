import z from "zod";
import { Gender } from "../../../generated/prisma/enums";


const createDoctorValidationZodSchema = z.object({

    password: z.string("password is required").min(8, "password must be at least 8 characters long"),
    doctor: z.object({

        name: z.string("name is required").min(3, "name must be at least 3 characters long"),
        email: z.email("email is required"),
        profilePhoto: z.string("profile photo is must string").optional(),
        address: z.string("address is must string").optional(),
        contactNumber: z.string("contact number is must string").min(11, "contact number must be at least 11 characters long").max(14, "contact number must be at most 14 characters long").optional(),
        registrationNumber: z.string("registration number is required").startsWith("Reg-").min(4, "registration number must be at least 4 characters long"),
        experience: z.number("experience is must number").optional(),
        gender: z.enum([Gender.MALE, Gender.FEMALE], "gender is required"),
        appointmentFee: z.number("appointment fee is required").nonnegative("appointment fee must be a positive number"),
        qualification: z.string("qualification is required").min(3, "qualification must be at least 3 characters long").max(500, "qualification must be at most 500 characters long"),
        currentWorkingPlace: z.string("current working place is required").min(3, "current working place must be at least 3 characters long"),
        designation: z.string("designation is required").min(3, "designation must be at least 3 characters long"),
    }),
    specialties: z.array(z.uuid("specialties must be a valid uuid")).min(1, "specialties must be at least 1")

})



export const createAdminValidationSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    admin: z.object({
        name: z.string().min(1, "Name is required"),
        email: z.email("Invalid email format"),
        profilePhoto: z.url("Invalid URL format").optional(),
        contactNumber: z.string().min(1, "Contact number is required"),

    }),
});




export const UserValidation = {
    createDoctorValidationZodSchema,
    createAdminValidationSchema,
};