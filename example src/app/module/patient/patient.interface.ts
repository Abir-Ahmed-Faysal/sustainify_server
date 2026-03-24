import { BloodGroup, Gender } from "../../../generated/prisma/enums";

export interface IUpdatePatientInfoPayload {
    name: string;
    email: string;
    profilePhoto: string;
    contactNumber: string;
    address: string;
}


export interface IUpdatePatientHealthDataPayload {
    height: string;
    weight: string;
    dateOfBirth: Date;
    gender: Gender;
    bloodGroup: BloodGroup;
    hasAllergies: boolean;
    hasDiabetes: boolean;
    smokingStatus: boolean;
    recentAnxiety: string;
    recentDepression: string;
    hasPastSurgery: boolean;
    pregnancyStatus: boolean;
    maritalStatus: boolean;
    bloodPressure: string;
    bloodSugar: string;
}


export interface IUpdateMedicalReport {
    reportName: string;
    reportLink: string;
    shouldDelete: boolean;
    reportId: string;
}


export interface IUpdatePatientProfilePayload {
    patientInfo: IUpdatePatientInfoPayload;
    patientHealthData: IUpdatePatientHealthDataPayload;
    medicalReports: IUpdateMedicalReport[];
}