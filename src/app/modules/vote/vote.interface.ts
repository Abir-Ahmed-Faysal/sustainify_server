import { VoteType } from "../../../generated/prisma";

export interface IVote {
  ideaId: string;
  type: VoteType;
}
