import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { IUserRequest } from "../../interfaces/user.interface";
import { IFavourite } from "./favourite.interface";

const toggleFavourite = async (user: IUserRequest, payload: IFavourite) => {
  const { ideaId } = payload;

  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
  });

  if (!idea) {
    throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
  }

  const existingFavourite = await prisma.favorite.findUnique({
    where: {
      userId_ideaId: {
        userId: user.id,
        ideaId: ideaId,
      },
    },
  });

  if (existingFavourite) {
    await prisma.favorite.delete({
      where: { id: existingFavourite.id },
    });

    return {
      action: "REMOVED",
    };
  }

  const newFavourite = await prisma.favorite.create({
    data: {
      userId: user.id,
      ideaId,
    },
    include: {
      idea: true
    }
  });

  return {
    action: "ADDED",
    favourite: newFavourite,
  };
};

const getMyFavourites = async (user: IUserRequest) => {
  const favourites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      idea: {
         include: {
             author: {
                 select: {
                     id: true,
                     name: true,
                     email: true
                 }
             }
         }
      }
    },
    orderBy: { id: "desc" }
  });

  return favourites;
};

export const favouriteService = {
  toggleFavourite,
  getMyFavourites,
};
