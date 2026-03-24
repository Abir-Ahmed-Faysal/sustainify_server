import { StatusCodes } from "http-status-codes";
import { IUserRequest } from "../../interfaces/IUserRequest";
import { prisma } from "../../lib/prisma";
import { ICreatePrescription } from "./prescription.interface";
import AppError from "../../errorHelpers/AppError";
import { Role } from "../../../generated/prisma/enums";
import { generatePrescription } from "./prescription.utils";
import { deleteFileFromCloudinary, uploadFileToCloudinary } from "../../config/cloudinary.config";
import { sendEmail } from "../../utilities/email";

const getAllPrescriptions = async () => {
  return prisma.prescription.findMany({
    include: { patient: true, doctor: true, appointment: true },
  });
};

const getMyPrescriptions = async (user: IUserRequest) => {
  const findUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { id: true, role: true },
  });
  if (!findUser) throw new AppError(StatusCodes.NOT_FOUND, "User not found");

  const whereClause =
    findUser.role === Role.PATIENT
      ? { patientId: findUser.id }
      : findUser.role === Role.DOCTOR
      ? { doctorId: findUser.id }
      : null;
  if (!whereClause) throw new AppError(StatusCodes.FORBIDDEN, "Not authorized");

  return prisma.prescription.findMany({ where: whereClause });
};

const createPrescription = async (user: IUserRequest, payload: ICreatePrescription) => {
  if (user.role !== Role.DOCTOR) throw new AppError(StatusCodes.FORBIDDEN, "Not authorized");

  // 1️⃣ Get doctor entity
  const doctor = await prisma.doctor.findUniqueOrThrow({ where: { userId: user.id } });

  // 2️⃣ Find appointment with patient & schedule
  const appointment = await prisma.appointment.findFirstOrThrow({
    where: { id: payload.appointmentId },
    include: {
      doctor: { select: { name: true, email: true, specialties: { include: { specialties: true } } } },
      patient: { select: { name: true, email: true,id:true } },
      schedule: { select: { startDateTime: true } },
    },
  });

  if (doctor.id !== appointment.doctorId) throw new AppError(StatusCodes.FORBIDDEN, "Not authorized");

  // 3️⃣ Check already prescribed
  const already = await prisma.prescription.findFirst({ where: { appointmentId: payload.appointmentId } });
  if (already) throw new AppError(StatusCodes.BAD_REQUEST, "Prescription already given");

  // 4️⃣ Validate follow-up date
  const followUpDate = new Date(payload.followUpDate);
  if (isNaN(followUpDate.getTime())) throw new AppError(StatusCodes.BAD_REQUEST, "Invalid follow up date");

  // 5️⃣ Transaction: create prescription + upload PDF + update PDF URL
  const prescription = await prisma.$transaction(async (tx) => {
    const created = await tx.prescription.create({
      data: {
        ...payload,
        followUpDate,
        doctorId: doctor.id,
        patientId: appointment.patient.id,
      },
    });

    // generate PDF
    const pdfBuffer = await generatePrescription({
      doctorName: appointment.doctor.name,
      doctorEmail: appointment.doctor.email,
      patientName: appointment.patient.name,
      patientEmail: appointment.patient.email,
      followUpDate,
      instructions: payload.instructions,
      prescriptionId: created.id,
      createdAt: new Date(),
      appointmentDate: appointment.schedule.startDateTime,
    });

    const fileName = `prescription-${created.id}.pdf`;
    const upload = await uploadFileToCloudinary(pdfBuffer, fileName);
    const pdfUrl = upload.secure_url;

    const updated = await tx.prescription.update({ where: { id: created.id }, data: { pdfUrl } });

    // send email (non-blocking)
    try {
      const doctorSpecialties = appointment.doctor.specialties as { specialties: { id: string; title: string } }[];
      await sendEmail({
        to: appointment.patient.email,
        subject: `Prescription from ${appointment.doctor.name}`,
        templateName: "prescription",
        templateData: {
          doctorName: appointment.doctor.name,
          patientName: appointment.patient.name,
          specialization: doctorSpecialties.map((s) => s.specialties.title).join(", "),
          instructions: payload.instructions,
          followUpDate: followUpDate.toLocaleString(),
          appointmentDate: appointment.schedule.startDateTime.toLocaleString(),
          prescriptionId: created.id,
          issueDate: new Date().toLocaleString(),
          pdfUrl,
        },
        attachments: [{ filename: fileName, content: pdfBuffer, contentType: "application/pdf" }],
      });
    } catch (err) {
      console.log("Failed to send prescription email", err);
    }

    return updated;
  },{maxWait: 100000, timeout: 200000});

  return prescription;
};

const updatePrescription = async (
  prescriptionId: string,
  payload: { instructions?: string; followUpDate?: string | Date },
  user: IUserRequest
) => {
  if (user.role !== Role.DOCTOR) throw new AppError(StatusCodes.FORBIDDEN, "Not authorized");

  const doctor = await prisma.doctor.findUniqueOrThrow({ where: { userId: user.id } });

  const prescription = await prisma.prescription.findFirstOrThrow({
    where: { id: prescriptionId, doctorId: doctor.id },
    include: {
      doctor: { include: { specialties: { include: { specialties: true } } } },
      patient: true,
      appointment: { include: { schedule: true } },
    },
  });

  const updatedInstructions = payload.instructions ?? prescription.instructions;
  const updatedFollowUpDate = payload.followUpDate ? new Date(payload.followUpDate) : prescription.followUpDate;
  if (isNaN(updatedFollowUpDate.getTime())) throw new AppError(StatusCodes.BAD_REQUEST, "Invalid follow-up date");

  // 1️⃣ Generate new PDF
  const pdfBuffer = await generatePrescription({
    doctorName: prescription.doctor.name,
    doctorEmail: prescription.doctor.email,
    patientName: prescription.patient.name,
    patientEmail: prescription.patient.email,
    followUpDate: updatedFollowUpDate,
    instructions: updatedInstructions,
    prescriptionId,
    createdAt: prescription.createdAt,
    appointmentDate: prescription.appointment.schedule.startDateTime,
  });

  const fileName = `prescription-${prescription.id}.pdf`;
  const upload = await uploadFileToCloudinary(pdfBuffer, fileName);
  const pdfUrl = upload.secure_url;

  // 2️⃣ Delete old PDF safely
  if (prescription.pdfUrl) {
    try {
      await deleteFileFromCloudinary(prescription.pdfUrl);
    } catch (err) {
      console.log("Failed to delete old prescription from Cloudinary", err);
    }
  }

  // 3️⃣ Update prescription
  const updatedPrescription = await prisma.prescription.update({
    where: { id: prescription.id },
    data: { instructions: updatedInstructions, followUpDate: updatedFollowUpDate, pdfUrl },
    include: { doctor: { include: { specialties: { include: { specialties: true } } } }, patient: true },
  });

  // 4️⃣ Send email (non-blocking)
  try {
    const doctorSpecialties = updatedPrescription.doctor.specialties as { specialties: { id: string; title: string } }[];
    await sendEmail({
      to: prescription.patient.email,
      subject: `Updated Prescription from ${prescription.doctor.name}`,
      templateName: "prescription",
      templateData: {
        doctorName: prescription.doctor.name,
        patientName: prescription.patient.name,
        specialization: doctorSpecialties.map((s) => s.specialties.title).join(", "),
        instructions: updatedInstructions,
        followUpDate: updatedFollowUpDate.toLocaleString(),
        appointmentDate: prescription.appointment.schedule.startDateTime.toLocaleString(),
        prescriptionId,
        issueDate: new Date().toLocaleString(),
        pdfUrl,
      },
      attachments: [{ filename: fileName, content: pdfBuffer, contentType: "application/pdf" }],
    });
  } catch (err) {
    console.log("Failed to send updated prescription email", err);
  }

  return updatedPrescription;
};

const deletePrescription = async (user: IUserRequest, id: string) => {
  if (user.role !== Role.DOCTOR) throw new AppError(StatusCodes.FORBIDDEN, "Not authorized");

  const doctor = await prisma.doctor.findUniqueOrThrow({ where: { userId: user.id } });
  const prescription = await prisma.prescription.findFirstOrThrow({ where: { id, doctorId: doctor.id } });

  if (prescription.pdfUrl) {
    try {
      await deleteFileFromCloudinary(prescription.pdfUrl);
    } catch (err) {
      console.log("Failed to delete prescription file from Cloudinary", err);
    }
  }

  return prisma.prescription.delete({ where: { id } });
};

export const prescriptionService = {
  getAllPrescriptions,
  getMyPrescriptions,
  createPrescription,
  updatePrescription,
  deletePrescription,
};