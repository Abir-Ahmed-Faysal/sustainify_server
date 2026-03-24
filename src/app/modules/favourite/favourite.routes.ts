import { Router } from "express";
import { favouriteController } from "./favourite.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma";
import { validateRequest } from "../../middleware/validateRequest";
import { favouriteValidation } from "./favourite.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.MEMBER, Role.ADMIN),
  validateRequest(favouriteValidation.toggleFavouriteZodSchema),
  favouriteController.toggleFavourite
);

router.get(
  "/my-favourites",
  checkAuth(Role.MEMBER, Role.ADMIN),
  favouriteController.getMyFavourites
);

export const favouriteRoutes = router;
