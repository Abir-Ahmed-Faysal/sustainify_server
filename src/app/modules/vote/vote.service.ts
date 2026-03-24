import { IdeaStatus, VoteType } from "../../../generated/prisma";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { StatusCodes } from "http-status-codes";
import { IUserRequest } from "../../interfaces/user.interface";
import { IVote } from "./vote.interface";

const toggleVote = async (user: IUserRequest, payload: IVote) => {
  const { ideaId, type } = payload;

  // 1. Check if the idea exists
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
  });

  if (!idea) {
    throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
  }

  if (idea.status !== IdeaStatus.APPROVED) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You can only vote on approved ideas"
    );
  }

  // 2. Check for an existing vote by the user
  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_ideaId: {
        userId: user.id,
        ideaId: ideaId,
      },
    },
  });

  return await prisma.$transaction(async (tx) => {
    let upVoteChange = 0;
    let downVoteChange = 0;

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove existing vote of same type
        await tx.vote.delete({
          where: { id: existingVote.id },
        });
        if (type === VoteType.UP) upVoteChange = -1;
        else downVoteChange = -1;
      } else {
        // Change vote type
        await tx.vote.update({
          where: { id: existingVote.id },
          data: { type },
        });
        if (type === VoteType.UP) {
          upVoteChange = 1;
          downVoteChange = -1;
        } else {
          upVoteChange = -1;
          downVoteChange = 1;
        }
      }
    } else {
      // Create new vote
      await tx.vote.create({
        data: {
          userId: user.id,
          ideaId,
          type,
        },
      });
      if (type === VoteType.UP) upVoteChange = 1;
      else downVoteChange = 1;
    }

    // Calculate new counts
    const newUpVotes = Math.max(0, idea.totalUpVotes + upVoteChange);
    const newDownVotes = Math.max(0, idea.totalDownVotes + downVoteChange);
    const totalVotes = newUpVotes + newDownVotes;
    
    // Calculate positive ratio
    const positiveRatio = totalVotes > 0 ? Math.ceil((newUpVotes / totalVotes) * 100) : 0;
    
    // Check if it should be featured (ratio over 80)
    const isFeatured = positiveRatio > 80;

    // Update Idea model
    const updatedIdea = await tx.idea.update({
      where: { id: ideaId },
      data: {
        totalUpVotes: newUpVotes,
        totalDownVotes: newDownVotes,
        positiveRatio: positiveRatio,
        isFeatured: isFeatured,
      },
    });

    return {
      idea: updatedIdea,
      action: existingVote && existingVote.type === type ? "REMOVED" : "VOTED",
    };
  });
};

export const voteService = {
  toggleVote,
};
