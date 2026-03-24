import { prisma } from "../../lib/prisma";
import { IUserRequest } from "../../interfaces/IUserRequest";
import { ICreateDoctorSchedule, IUpdateDoctorSchedule } from "./doctorSchedule.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utilities/QueryBuilder";
import { DoctorSchedule, Prisma } from "../../../generated/prisma/client";
import { doctorScheduleIncludeConfig } from "./doctor.constant";


const createMyDoctorSchedule = async (user: IUserRequest, payload: ICreateDoctorSchedule) => {

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email }
  })


  const scheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }))


  const result = await prisma.doctorSchedule.createMany({
    data: scheduleData
  })

  return result
};



const getMyDoctorSchedules = async (user: IUserRequest, query: IQueryParams) => {

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email
    }
  })

  const queryBuilder = new QueryBuilder<DoctorSchedule, Prisma.DoctorScheduleWhereInput, Prisma.DoctorScheduleInclude>(prisma.doctorSchedule, { doctorId: doctorData.id, ...query }, {
    filterableFields: [],
    searchableFields: [],
  })

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .dynamicInclude(doctorScheduleIncludeConfig)
    .sort()
    .fields()
    .execute()


  return result
};


const getAllDoctorSchedules = async (query: IQueryParams) => {

  const queryBuilder = new QueryBuilder<DoctorSchedule, Prisma.DoctorScheduleWhereInput, Prisma.DoctorScheduleInclude>(prisma.doctorSchedule, query, {
    filterableFields: [],
    searchableFields: [],
  })

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .dynamicInclude(doctorScheduleIncludeConfig)
    .sort()
    .fields()
    .execute()


  return result
};

const getDoctorScheduleById = async (doctorId: string, scheduleId: string) => {
  const doctorData = await prisma.doctorSchedule.findUnique({
    where: {
      doctorId_scheduleId: {
        doctorId,
        scheduleId
      }
    },
    include: {
      schedule: true,
      doctor: true
    }
  })


  return doctorData
};


const updateMyDoctorSchedule = async (

  user: IUserRequest,
  payload: IUpdateDoctorSchedule
) => {

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email }
  });

  const deleteIds = payload.scheduleIds
    .filter(s => s.shouldDelete)
    .map(s => s.id);

  const createIds = payload.scheduleIds
    .filter(s => !s.shouldDelete)
    .map(s => s.id);

  const result = await prisma.$transaction(async (tx) => {

    // ---------- DELETE ----------
    if (deleteIds.length > 0) {
      await tx.doctorSchedule.deleteMany({
        where: {
          doctorId: doctorData.id,
          scheduleId: { in: deleteIds },
        },
      });
    }

    // ---------- CREATE ----------
    if (createIds.length > 0) {

      const doctorScheduleData = createIds.map(scheduleId => ({
        doctorId: doctorData.id,
        scheduleId
      }));

      await tx.doctorSchedule.createMany({
        data: doctorScheduleData,
        skipDuplicates: true // 🔥 important
      });
    }

    return { success: true };
  });

  return result;
};


const deleteMyDoctorSchedule = async (scheduleId: string, user: IUserRequest) => {

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: { email: user.email }
  })

  await prisma.doctorSchedule.delete({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId
      }
    }
  })

};

export const doctorScheduleService = {
  createMyDoctorSchedule,
  getMyDoctorSchedules,
  getAllDoctorSchedules,
  getDoctorScheduleById,
  updateMyDoctorSchedule,
  deleteMyDoctorSchedule,
};