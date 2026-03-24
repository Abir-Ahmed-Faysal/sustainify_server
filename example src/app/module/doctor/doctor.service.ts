import { StatusCodes } from "http-status-codes"
import AppError from "../../errorHelpers/AppError"
import { prisma } from "../../lib/prisma"
import { IUpdateDoctorPayload } from "./doctor.interface";
import { QueryBuilder } from "../../utilities/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { doctorFilterableFields, doctorIncludeConfig, doctorSearchableFields } from "./doctor.constant";
import { Doctor, Prisma } from "../../../generated/prisma/client";
import { IUserRequest } from "../../interfaces/IUserRequest";



const getAllDoctors = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<Doctor, Prisma.DoctorWhereInput, Prisma.DoctorInclude>(
    prisma.doctor,
    query,
    {
      searchableFields: doctorSearchableFields,
      filterableFields: doctorFilterableFields,
    }
  )

  const result = await queryBuilder
    .search()
    .filter()
    .where({
      isDeleted: false,
    })
    .include({
      user: true,
      // specialties: true,
      specialties: {
        include: {
          specialties: true
        }
      },
    })
    .dynamicInclude(doctorIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .execute();

  console.log(result);
  return result;
}


const getDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findFirst({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      specialties: {
        include: {
          specialties: true,
        },
      },
    },
  });

  if (!doctor) {
    throw new AppError(StatusCodes.NOT_FOUND, "Doctor not found");
  }

  // Transform specialties to flatten structure
  return {
    ...doctor,
    specialties: doctor.specialties.map((s) => s.specialties),
  };
};



const updateDoctor = async (user: IUserRequest, payload: IUpdateDoctorPayload) => {
  // Check if doctor exists and not deleted
  const existingDoctor = await prisma.doctor.findFirst({
    where: { email: user.email, isDeleted: false },
  });

  if (!existingDoctor) {
    throw new AppError(StatusCodes.NOT_FOUND, "Doctor not found");
  }

  // Separate specialties from doctor data
  const { specialties, doctor: doctorData } = payload;

  // Update doctor basic information
  await prisma.$transaction(async (tx) => {
    if (doctorData) {
      await tx.doctor.update({
        where: {id:existingDoctor.id },
        data: doctorData,

      });
    }

    if (doctorData?.name && doctorData?.profilePhoto) {
      await tx.user.update({
        where: {
          email: existingDoctor.email
        }, data: {
          name: doctorData.name,
          image: doctorData.profilePhoto
        }
      })
    }


    if (specialties && specialties.length > 0) {
      for (const specialty of specialties) {

        const { specialtyId, shouldDelete } = specialty


        if (shouldDelete) {
          await tx.doctorSpecialty.deleteMany({
            where: {
              doctorId: existingDoctor.id,
              specialtyId: specialtyId,
            },
          });
        } else {
          await tx.doctorSpecialty.upsert({
            where: {
              doctorId_specialtyId: {
                doctorId: existingDoctor.id,
                specialtyId: specialtyId,
              },
            }, create: {
              doctorId: existingDoctor.id,
              specialtyId: specialtyId,
            }, update: {

            }
          })
        }
      }
    }
  })


  const doctor = await getDoctorById(existingDoctor.id)
  return doctor
};





const deleteDoctor = async (user:IUserRequest) => {
  const exists = await prisma.doctor.findFirst({
    where: {
      email:user.email,
      isDeleted: false
    }
  })

  if (!exists) {
    throw new AppError(StatusCodes.NOT_FOUND, "Doctor not found")
  }


  await prisma.$transaction(async (tx) => {

    await tx.user.update({
      where: {
        id: exists.userId
      },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    })

    await tx.doctor.update({
      where: {
        id:exists.id
      },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    })

    await tx.session.deleteMany({
      where: {
        userId: exists.userId
      }
    })


    await tx.doctorSpecialty.deleteMany({
      where: {
        doctorId: exists.id
      }
    })
  })

  return { message: "Doctor deleted successfully" }
}



export const doctorService = {
  updateDoctor, deleteDoctor,
  getAllDoctors, getDoctorById
}