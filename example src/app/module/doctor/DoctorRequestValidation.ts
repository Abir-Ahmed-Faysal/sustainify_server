import z from "zod";
import { Gender } from "../../../generated/prisma/enums";

/*
name          String
profilePhoto  String
address       String
contactNumber String
averageRating String
registrationNumber  String
experience          Int
gender              Gender
appointmentFee      Float
qualification       String
currentWorkingPlace String
designation         String
*/ 

const updateDoctorValidationSchema = z.object({
  
    name: z.string().optional(),
    profilePhoto: z.url("Invalid URL format").optional(),
    contactNumber: z.string().optional(),
    registrationNumber: z.string().optional(),
    experience: z
      .int("Experience must be a whole number")
      .min(0, "Experience cannot be negative")
      .optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    appointmentFee: z
      .number()
      .positive("Appointment fee must be positive")
      .optional(),
    qualification: z.string().optional(),
    currentWorkingPlace: z.string().optional(),
    designation: z.string().optional(),
    specialties: z
      .array(z.uuid("Each specialty ID must be a valid UUID"))
      .optional(),
 
});


const updateDoctorProfileValidationSchema = z.object({

  name: z.string().optional(),
  profilePhoto: z.url("Invalid URL format").optional(),
  address: z.string().optional(),
  contactNumber: z.string().optional(),
  averageRating: z.string().optional(),
  registrationNumber: z.string().optional(),
  experience: z.number().optional(),
  gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
  appointmentFee: z.number().optional(),
  qualification: z.string().optional(),
  currentWorkingPlace: z.string().optional(),
  designation: z.string().optional(),

});

export const DoctorValidation = {
  updateDoctorValidationSchema,updateDoctorProfileValidationSchema
};