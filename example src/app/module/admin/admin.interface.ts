
import { Role, UserStatus } from "../../../generated/prisma/enums";

interface IAdminFilterRequest {
  id: string;
}

interface IAdminUpdatePayload {
  name: string
  profilePhoto: string
  contactNumber: string
}

export type { IAdminFilterRequest, IAdminUpdatePayload };


export interface IChangeUserStatusPayload {
  userId: string,
  userStatus: UserStatus,
}

export interface IChangeUserRolePayload {
  userId: string;
  role: Role
}