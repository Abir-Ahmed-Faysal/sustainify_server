import { uuidv7 } from "uuidv7";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IUserRequest } from "../../interfaces/IUserRequest";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface";
import { AppointmentStatus, PaymentStatus, Role } from "../../../generated/prisma/enums";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utilities/QueryBuilder";
import { Appointment, Prisma } from "../../../generated/prisma/client";
import { appointmentFilterableFields, appointmentIncludeConfig, appointmentSearchableFields } from "./appointment.constant";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";



const getAllAppointments = async (query: IQueryParams) => {

  const queryBuilder = new QueryBuilder<Appointment, Prisma.AppointmentWhereInput, Prisma.AppointmentInclude>(prisma.appointment, query, {
    filterableFields: appointmentFilterableFields,
    searchableFields: appointmentSearchableFields,
  })


  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .dynamicInclude(appointmentIncludeConfig)
    .sort()
    .fields()
    .execute()

  return result
}


// 🔹 Doctor/Patient → My Appointments
const getMyAppointments = async (user: IUserRequest) => {
  const patientData = await prisma.patient.findUnique({
    where: {
      email: user?.email,
      isDeleted: false
    }
  });

  if (patientData) {
    return prisma.appointment.findMany({
      where: {
        patientId: patientData.id
      },
      include: {
        doctor: true,
        schedule: true
      }
    });
  }

  const doctorData = await prisma.doctor.findUnique({
    where: {
      email: user?.email,
      isDeleted: false
    }
  });

  if (doctorData) {
    return prisma.appointment.findMany({
      where: {
        doctorId: doctorData.id
      },
      include: {
        doctor: true,
        schedule: true
      }
    });
  }

  throw new AppError(StatusCodes.NOT_FOUND, "user not found");
};


// 🔹 Doctor/Patient → Single My Appointment
const getMySingleAppointment = async (appointmentId: string, user: IUserRequest) => {
  const appointment = await prisma.appointment.findUnique({
    where: {
      id: appointmentId,
      OR: [
        { patientId: user.id },
        { doctorId: user.id }
      ]
    }
  })

  return appointment
};



export const bookAppointment = async (
  payload: IBookAppointmentPayload,
  user: IUserRequest
) => {


  const patient = await prisma.patient.findFirstOrThrow({
    where: {
      email: user.email,
      isDeleted: false
    }
  })


  const doctor = await prisma.doctor.findFirstOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false

    }, include: {
      specialties: true
    }
  })


  const videoCallingId = String(uuidv7())


  const result = await prisma.$transaction(async (tx) => {


    const scheduleUpdate = await tx.doctorSchedule.updateMany({
      where: {
        doctorId: doctor.id,
        scheduleId: payload.scheduleId,
        isBooked: false
      },
      data: {
        isBooked: true
      }
    })

    if (scheduleUpdate.count === 0) {
      throw new AppError(StatusCodes.CONFLICT, "This schedule is already booked")
    }


    const appointment = await tx.appointment.create({
      data: {
        doctorId: doctor.id,
        patientId: patient.id,
        scheduleId: payload.scheduleId,
        videoCallingId
      },
      include: {
        doctor: true,
        patient: true,
        schedule: true,
        payment: true
      }
    })



    const transitionId = String(uuidv7())


    const paymentData = await tx.payment.create({
      data: {
        appointmentId: appointment.id,
        amount: doctor.appointmentFee,
        transitionId,

      }
    })


    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'bdt',
          product_data: { name: `appointment with Dr. ${doctor.name}` },
          unit_amount: doctor.appointmentFee * 100
        },
        quantity: 1
      },
      ], metadata: {
        appointmentId: appointment.id,
        paymentId: paymentData.id
      },
      success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success?appointment_id=${appointment.id}&payment_id=${appointment.payment?.id}`,
      cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments?error=payment_cancelled`
    })
    return {
      appointment,
      paymentData,
      paymentUrl: session.url
    }
  })

  return {
    appointment: result.appointment,
    payment: result.paymentData,
    paymentUrl: result.paymentUrl
  }
}


const bookAppointmentWithPayLater = async (
  payload: IBookAppointmentPayload,
  user: IUserRequest
) => {


  const patient = await prisma.patient.findFirstOrThrow({
    where: {
      email: user.email,
      isDeleted: false
    }
  })


  const doctor = await prisma.doctor.findFirstOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false

    }, include: {
      specialties: true
    }
  })





  const result = await prisma.$transaction(async (tx) => {


    const scheduleUpdate = await tx.doctorSchedule.updateMany({
      where: {
        doctorId: doctor.id,
        scheduleId: payload.scheduleId,
        isBooked: false
      },
      data: {
        isBooked: true
      }
    })

    if (scheduleUpdate.count === 0) {
      throw new AppError(StatusCodes.CONFLICT, "This schedule is already booked")
    }
    const videoCallingId = String(uuidv7())

    const appointment = await tx.appointment.create({
      data: {
        doctorId: doctor.id,
        patientId: patient.id,
        scheduleId: payload.scheduleId,
        videoCallingId
      },
      include: {
        doctor: true,
        patient: true,
        schedule: true,

      }
    })

    const transitionId = String(uuidv7())


    const paymentData = await tx.payment.create({
      data: {
        appointmentId: appointment.id
        , amount: doctor.appointmentFee,
        transitionId
      }
    })




    return { appointment, payment: paymentData }
  })

  return { appointment: result }
}


const initiatePayment = async (appointmentId: string, user: IUserRequest) => {

  const patientData = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email }
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
      patientId: patientData.id
    },
    include: {
      doctor: true,
      payment: true
    }
  });

  if (!appointmentData.payment) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Payment record not found for this appointment"
    );
  }

  if (appointmentData.payment.status === PaymentStatus.PAID) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Payment already completed"
    );
  }

  if (appointmentData.appointmentStatus === AppointmentStatus.CANCELLED) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Appointment already cancelled"
    );
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: `Appointment with Dr. ${appointmentData.doctor.name}`
          },
          unit_amount: appointmentData.doctor.appointmentFee * 100
        },
        quantity: 1
      }
    ],

    metadata: {
      appointmentId: appointmentData.id,
      paymentId: appointmentData.payment.id,
      patientId: patientData.id
    },

    success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success?appointment_id=${appointmentData.id}&payment_id=${appointmentData.payment?.id}`,
    cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments?error=payment_cancelled`
  });

  await prisma.payment.update({
    where: { id: appointmentData.payment.id },
    data: {
      stripeEventId: session.id
    }
  });

  return {
    paymentUrl: session.url
  };
};


const cancelUnpaidAppointment = async () => {

  const beforeThirtyMinutes = new Date(Date.now() - 30 * 60 * 1000)

  const unPaidAppointments = await prisma.appointment.findMany({
    where: {
      // appointmentStatus: AppointmentStatus.SCHEDULED,
      createdAt: { lte: beforeThirtyMinutes },
      status: PaymentStatus.UNPAID,
    }
  })

  const appointmentToCancel = unPaidAppointments.map((appointment) => appointment.id)


  await prisma.$transaction(async (tx) => {

    await tx.appointment.updateMany({
      where: {
        id: { in: appointmentToCancel }
      }, data: {
        appointmentStatus: AppointmentStatus.CANCELLED
      }
    })

    await tx.payment.deleteMany({
      where: {
        appointmentId: { in: appointmentToCancel }
      }
    })


    for (const unPaidAppointment of unPaidAppointments) {
      await tx.doctorSchedule.update({
        where: {
          doctorId_scheduleId: {
            doctorId: unPaidAppointment.doctorId,
            scheduleId: unPaidAppointment.scheduleId
          }
        },
        data: {
          isBooked: false
        }
      })
    }
  })

  console.log(`automatically clear unpaid appointment successfully`);
}

const changeAppointmentStatus = async (
  appointmentId: string,
  requestedStatus: AppointmentStatus,
  user: IUserRequest
) => {

  if (!Object.values(AppointmentStatus).includes(requestedStatus)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid requested status");
  }

  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: { id: appointmentId },
    include: { doctor: true, patient: true }
  })


  if (
    user.role === Role.DOCTOR &&
    appointment.doctor.email !== user.email
  ) {
    throw new AppError(StatusCodes.FORBIDDEN, "Not authorized")
  }

  if (
    user.role === Role.PATIENT &&
    appointment.patient.email !== user.email
  ) {
    throw new AppError(StatusCodes.FORBIDDEN, "Not authorized")
  }

  const currentStatus = appointment.appointmentStatus
  let nextStatus: AppointmentStatus | null = null


  if (user.role === Role.DOCTOR) {

    if (currentStatus === AppointmentStatus.SCHEDULED &&
      requestedStatus === AppointmentStatus.ONPROGRESS) {
      nextStatus = AppointmentStatus.ONPROGRESS
    }

    else if (currentStatus === AppointmentStatus.ONPROGRESS &&
      requestedStatus === AppointmentStatus.COMPLETE) {
      nextStatus = AppointmentStatus.COMPLETE
    }

    else {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid status transition")
    }

  }

  else if (user.role === Role.PATIENT) {

    if (currentStatus === AppointmentStatus.SCHEDULED) {
      nextStatus = AppointmentStatus.CANCELLED
    } else {
      throw new AppError(StatusCodes.BAD_REQUEST, "Cannot cancel now")
    }

  } else if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
    nextStatus = requestedStatus
  }

  if (!nextStatus) {
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to determine next status");
  }



  await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id: appointmentId },
      data: { appointmentStatus: nextStatus }
    })

    tx.doctorSchedule.update({
      where: {
        doctorId_scheduleId: {
          doctorId: appointment.doctorId,
          scheduleId: appointment.scheduleId
        }
      }, data: {
        isBooked: false
      }
    })
  })

  return { message: "Appointment status updated successfully" }
}




export const AppointmentService = {
  cancelUnpaidAppointment,
  getAllAppointments,
  getMyAppointments,
  getMySingleAppointment,
  bookAppointment,
  changeAppointmentStatus,
  initiatePayment,
  bookAppointmentWithPayLater
};

