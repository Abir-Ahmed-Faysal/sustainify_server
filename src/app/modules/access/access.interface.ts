export interface IAccessRecord {
    id: string;
    userId: string;
    ideaId: string;
    createdAt: Date;
    updatedAt: Date;
    idea?: any; // Prisma Idea relation
    user?: any; // Prisma User relation
}

export interface IAccessHistoryResponse {
    data: IAccessRecord[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
