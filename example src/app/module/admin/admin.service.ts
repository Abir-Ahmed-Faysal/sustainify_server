/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { IAdminUpdatePayload, IChangeUserRolePayload, IChangeUserStatusPayload } from "./admin.interface";
import { IUserRequest } from "../../interfaces/IUserRequest";
import { Role, UserStatus } from "../../../generated/prisma/enums";



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


const updateAdminProfile = async (
  user: IUserRequest,
  payload: IAdminUpdatePayload
) => {

  const adminData = await prisma.admin.findUniqueOrThrow({
    where: { email: user.email }
  })

  await prisma.$transaction(async (tx) => {

    await tx.admin.update({
      where: { id: adminData.id },
      data: payload
    })

    const userPayload: any = { ...payload }

    if (payload.profilePhoto) {
      userPayload.image = payload.profilePhoto
      delete userPayload.profilePhoto
    }

    await tx.user.update({
      where: { email: user.email },
      data: userPayload
    })

  })

  const result = await prisma.admin.findUniqueOrThrow({
    where: { email: adminData.email },
  })

  return result
}


const deleteAdmin = async (id: string) => {
  const exists = await prisma.admin.findFirst({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!exists) {
    throw new AppError(StatusCodes.NOT_FOUND, "admin not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: exists.userId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.admin.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.session.deleteMany({
      where: {
        userId: id
      }
    })
  });

  return { message: "admin data deleted successfully" };
};


const changeUserStatus = async (user: IUserRequest, payload: IChangeUserStatusPayload) => {
  // 1.super admin change change the status of any user (admin , doctor,patient). Except himself. He cannot change his own status

  // 2.Admin can change the status of doctor and patient. Except himself. He cannot change the status of super admin and other admin user.

  const isAdminExists = await prisma.admin.findUniqueOrThrow({
    where: {
      email: user.email,
      isDeleted: false,
    }, include: {
      user: true
    }
  })

  const { userId, userStatus } = payload

  const userToChangeToStatus = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId
    }
  })

  const selfStatusChange = isAdminExists.userId === userToChangeToStatus.id

  if (selfStatusChange) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Failed to change own status")
  }

  if (isAdminExists.user.role === Role.ADMIN && (userToChangeToStatus.role === Role.ADMIN || userToChangeToStatus.role === Role.SUPER_ADMIN)) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Failed to change own status")
  }

  if (userStatus === UserStatus.DELETED) {
    throw new AppError(StatusCodes.BAD_REQUEST, "you cannot set user status to deleted. To delete a user, you have to use role specific delete admin api which will set the user status to delete adn also set isDelete to true and also the user session and account ")
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId
    }, data: {
      status: userStatus
    }
  })

  return updatedUser
}


const changeUserRole = async (user: IUserRequest, payload: IChangeUserRolePayload) => {
  // 1. super admin can change the role of only other super admin and admin user>ho cannot change his own role 

  // 2. admin cannot change role of any user 

  // 3. Role of patient and doctor user cannot be changed by anyone. If needed, they have to be deleted and recreated with new role 

  const isSuperAdminExist = await prisma.super_Admin.findUniqueOrThrow({
    where:
    {
      email: user.email,
      isDeleted: false
    }, include: {
      user: true
    }
  })


  const { userId, role } = payload



  const findUserToChange = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
      isDeleted: false
    }
  })


  if (isSuperAdminExist.userId === findUserToChange.id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Forbidden to change own status")
  }

  if (isSuperAdminExist.user.role !== Role.SUPER_ADMIN) {
    throw new AppError(StatusCodes.FORBIDDEN, "you are not authorized to change to role expect super")
  }

  if (findUserToChange.role === Role.DOCTOR || findUserToChange.role === Role.PATIENT) {
    throw new AppError(StatusCodes.BAD_REQUEST, "you cant not change the role of doctor of patient user, you have to delete the user and recreate with new role")
  }


  const updateUser = await prisma.user.update({
    where: {
      id: userId
    }, data: {
      role
    }
  })

return updateUser


}


export const adminService = {
  getAllAdmins,
  getAdminById,
  updateAdminProfile,
  deleteAdmin,
  changeUserStatus,
  changeUserRole,
};