import { Gender } from "../../../generated/prisma/enums";




export interface ICreateDoctorPayload {
    password: string;
    doctor: {
        name: string;
        email: string;
        profilePhoto?: string;
        address?: string;
        contactNumber?: string;
        registrationNumber: string;
        experience?: number;
        gender: Gender;
        appointmentFee: number;
        qualification: string;
        currentWorkingPlace: string;
        designation: string;
    },
    specialties: string[]
}


export interface ICreateAdmin {
  password: string;
  admin: {
    name: string;
    email: string;
    profilePhoto?: string;
    contactNumber: string;
  };
}

/*
make a json data for the icreate admin
{
    "password": "string",
    "admin": {
        "name": "string",
        "email": "string",
        "profilePhoto": "string",
        "contactNumber": "string"
    }}
*/ 