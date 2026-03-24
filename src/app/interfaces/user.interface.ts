import { Role } from "../../generated/prisma";

export interface IUserRequest {
    id: string;
    name: string;
    email: string;
    role: Role;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
