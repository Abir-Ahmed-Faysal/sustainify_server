import { Role } from "../../generated/prisma/enums";

export interface IUserRequest {
    id: string;
    name: string;
    email: string;
    role: Role;
   
   
}