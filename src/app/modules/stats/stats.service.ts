import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";

import { prisma } from "../../lib/prisma";
import { IdeaStatus, Role } from "../../../generated/prisma";
import { IUserRequest } from "../../interfaces/user.interface";


const getDashboardStatsData = async (user: IUserRequest) => {

  let statsData;

  switch (user.role) {

    case Role.ADMIN:
      statsData = await getAdminStatsData();
      break;


    case Role.MEMBER:
      statsData = await getMemberStatsData(user);
      break;

    default:
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "You are not authorized to access this route"
      );
  }

  return statsData;
};


const getAdminStatsData = async () => {
  // Run all queries in parallel
  const [ideaCounts, categoryCount, paidIdeas, totalIdea] = await Promise.all([
    prisma.idea.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.category.count(),
    prisma.idea.count({
      where: {
        isPaid: true
      }
    }),
    prisma.idea.count()
  ]);

  // Transform ideaCounts into an easy-to-use object
  const stats: Record<string, number> = {
    approved: 0,
    rejected: 0,
    draft: 0,
    underReview: 0,
    paidIdeas: 0,
    totalIdea: 0
  };

  ideaCounts.forEach(item => {
    switch (item.status) {
      case IdeaStatus.APPROVED:
        stats.approved = item._count;
        break;
      case IdeaStatus.DRAFT:
        stats.draft = item._count;
        break;

      case IdeaStatus.UNDER_REVIEW:
        stats.underReview = item._count;
        break;

      case IdeaStatus.REJECTED:
        stats.rejected = item._count;
        break;
    }
  });

  return {
    approved: stats.approved,
    rejected: stats.rejected,
    underReview: stats.underReview,
    totalCategory: categoryCount,
    paidIdeas,
    totalIdea
  };
};







const getMemberStatsData = async (user: IUserRequest) => {
  const [ideaCounts, total] = await Promise.all([
    prisma.idea.groupBy({
      by: ['status'],
      _count: true,
      where: {
        authorId: user.id
      }
    }),

    prisma.idea.count({
      where: { authorId: user.id }
    })
  ]);

  const stats: Record<string, number> = {
    approved: 0,
    rejected: 0,
    draft: 0,
    underReview: 0,
    total: 0
  };

  ideaCounts.forEach(item => {
    switch (item.status) {
      case IdeaStatus.APPROVED:
        stats.approved = item._count;
        break;
      case IdeaStatus.DRAFT:
        stats.draft = item._count;
        break;
      case IdeaStatus.UNDER_REVIEW:
        stats.underReview = item._count;
        break;
      case IdeaStatus.REJECTED:
        stats.rejected = item._count;
        break;
    }
  });

  return {
    approved: stats.approved,
    rejected: stats.rejected,
    underReview: stats.underReview,
    draft: stats.draft,
    total
  };
};





export const statsService = {
  getDashboardStatsData
};