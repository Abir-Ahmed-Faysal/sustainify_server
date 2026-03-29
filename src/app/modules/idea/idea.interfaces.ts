import { IdeaStatus } from "../../../generated/prisma";




export interface IIdea {
  id: string;
  title: string;
  problemStatement: string;
  solution: string;
  description: string;
  image?: string | null;
  positiveRatio: number;
  totalUpVotes: number;
  totalDownVotes: number;
  attachments: string[];

  isPaid: boolean;
  price?: number | null;

  status: IdeaStatus;
  feedback?: string | null;
  isFeatured: boolean;

  authorId: string;
  categoryId: string;

  author: {
    id: string;
    name: string;
    email: string;
    profile?: {
      avatar?: string | null;
    } ;
  };

  category: {
    id: string;
    name: string;
    image?: string | null;
  };

  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date | null;
}

export interface IIdeaUpdate {
    title?: string;
    problemStatement?: string;
    solution?: string;
    description?: string;
    image?: string;
    price?: number;
    categoryId?: string;
    status?: IdeaStatus;
    feedback?: string;
    isFeatured?: boolean;
    attachments?: string[];
}


export interface IIdeaCreatePayload {
    title: string;
    problemStatement: string;
    solution: string;
    description: string;
    image?: string;
    price?: number;
    categoryId: string;
    isPaid?: boolean;
    attachments?: string[];
}
