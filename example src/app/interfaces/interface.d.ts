import { IUserRequest } from "./IUserRequest"

declare global {
  namespace Express {
    interface Request {
      user?: IUserRequest
    }
  }
}
