export interface IAccessRecord {
    id: string;
    userId: string;
    ideaId: string;
    createdAt: Date;
    updatedAt: Date;
    idea?: Record<string, unknown>; // Prisma Idea relation
    user?: Record<string, unknown>; // Prisma User relation
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
