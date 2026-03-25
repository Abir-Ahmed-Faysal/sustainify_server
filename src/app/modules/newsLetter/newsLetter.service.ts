import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { INewsLetter } from "./newsLetter.interface";

const subscribe = async (payload: INewsLetter) => {
  const { email } = payload;

  const existingSubscription = await prisma.newsletter.findUnique({
    where: { email },
  });

  if (existingSubscription) {
    if (!existingSubscription.isActive) {
      const reactivated = await prisma.newsletter.update({
        where: { email },
        data: { isActive: true },
      });
      return reactivated;
    }
    throw new AppError(StatusCodes.CONFLICT, "Email is already subscribed to the newsletter");
  }

  const newSubscription = await prisma.newsletter.create({
    data: {
      email,
    },
  });

  return newSubscription;
};

const getAllSubscribers = async () => {
  const subscribers = await prisma.newsletter.findMany({
    orderBy: { createdAt: "desc" },
  });

  return subscribers;
};

export const newsLetterService = {
  subscribe,
  getAllSubscribers,
};
