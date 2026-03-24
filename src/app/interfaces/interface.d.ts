import { IUserRequest } from "./user.interface";


declare global {
  namespace Express {
    interface Request {
      user?: IUserRequest
    }
  }
}
