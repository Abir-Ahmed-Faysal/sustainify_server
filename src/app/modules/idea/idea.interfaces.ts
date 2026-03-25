import { IdeaStatus } from "../../../generated/prisma";


export interface IIdea {
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
