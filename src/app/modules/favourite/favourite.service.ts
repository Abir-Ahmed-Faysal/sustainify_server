/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { IUserRequest } from "../../interfaces/user.interface";
import { IFavourite } from "./favourite.interface";

const toggleFavourite = async (user: IUserRequest, payload: IFavourite) => {
  try {
    const { ideaId } = payload;

    const idea = await prisma.idea.findUnique({
      where: { id: ideaId, isDeleted: false },
      select: { id: true },
    });

    if (!idea) {
      throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
    }

    const existingFavourite = await prisma.favourite.findUnique({
      where: {
        userId_ideaId: {
          userId: user.id,
          ideaId: ideaId,
        },
      },
    });

    if (existingFavourite) {
      const deletedFavourite = await prisma.favourite.delete({
        where: { id: existingFavourite.id },
        include: { idea: true },
      });

      return {
        action: "REMOVED",
        favourite: deletedFavourite,
      };
    }

    const newFavourite = await prisma.favourite.create({
      data: {
        userId: user.id,
        ideaId,
      },
      include: { idea: true },
    });

    return {
      action: "ADDED",
      favourite: newFavourite,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to toggle favorite"
    );
  }
};


const getMyFavourites = async (user: IUserRequest) => {
  try {
    const favourites = await prisma.favourite.findMany({
      where: { userId: user.id },
      include: {
        idea: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { id: "desc" },
    });

    return favourites;
  } catch (_error: any) { // eslint-disable-line @typescript-eslint/no-unused-vars
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to retrieve favorites"
    );
  }
};

export const favouriteService = {
  toggleFavourite,
  getMyFavourites,
};
