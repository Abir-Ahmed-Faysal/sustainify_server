import { Gender } from "../../../generated/prisma/enums";

interface ISpecialties {
    specialtyId: string;
    shouldDelete?: boolean;
}

export interface IUpdateDoctorPayload {
    doctor?: {
        name?: string;
        profilePhoto?: string;
        address?: string;
        experience?: number;
        contactNumber?: string;
        registrationNUmber?: string;
        gender?: Gender;
        appointmentFee?: number;
        qualification?: string;
        currentWorkingPlace?: string;
        designation?: string;
    }

    specialties?: ISpecialties[];
}


export interface updateDoctorProfile {
    name: string
    profilePhoto: string
    address: string
    contactNumber: string
    averageRating: string
    registrationNumber: string
    experience: number
    gender: Gender
    appointmentFee: number
    qualification: string
    currentWorkingPlace: string
    designation: string
}


