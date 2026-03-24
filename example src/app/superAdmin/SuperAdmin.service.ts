import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma";
import AppError from "../errorHelpers/AppError";
import { IAdminUpdatePayload } from "./superAdmin.interface";
import { IUserRequest } from "../interfaces/IUserRequest";



const getAllAdmins = async () => {
  const result = await prisma.admin.findMany({
    where: {
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      profilePhoto: true,
      contactNumber: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};



const getAdminById = async (id: string) => {
  const admin = await prisma.admin.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!admin) {
    throw new AppError(StatusCodes.NOT_FOUND, "admin not found");
  }

  return admin;
};



const updateAdmin = async (id: string, user: IUserRequest, payload: IAdminUpdatePayload) => {
  if (user.userId === id) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "You won't update your super admin Profile");
  }

  const existingAdmin = await prisma.admin.findFirst({
    where: { id, isDeleted: false },
  });

  if (!existingAdmin) {
    throw new AppError(StatusCodes.NOT_FOUND, "admin not found");
  }

  const updatedAdmin = await prisma.admin.update({
    where: { id },
    data: payload,
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return updatedAdmin;
};



const deleteAdmin = async (id: string, user: IUserRequest) => {
  if (user.userId === id) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "You won't delete your super admin Profile");
  }

  const exists = await prisma.admin.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!exists) {
    throw new AppError(StatusCodes.NOT_FOUND, "admin not found");
  }

  const data = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: exists.userId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    const adminData = await tx.admin.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return adminData;
  });

  return data;
};



export const adminService = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
};