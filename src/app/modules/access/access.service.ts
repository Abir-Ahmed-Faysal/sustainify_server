import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utilities/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { IAccessHistoryResponse, IAccessRecord } from "./access.interface";

/**
 * Check if the authenticated user has accessed a specific idea
 * @param userId - The user's ID (from JWT)
 * @param ideaId - The idea's ID
 * @returns boolean - true if access record exists, false otherwise
 */
const checkMyAccessToIdea = async (userId: string, ideaId: string): Promise<boolean> => {
    try {
        const accessRecord = await prisma.access.findUnique({
            where: {
                userId_ideaId: {
                    userId,
                    ideaId,
                },
            },
        });

        return !!accessRecord;
    } catch (error) {
        console.error("Failed to check access status:", error);
        throw new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Failed to check access status"
        );
    }
};

/**
 * Get all ideas pursued/accessed and paid for by the authenticated user with pagination
 * Queries Access table and returns paid ideas with details
 * @param userId - The user's ID (from JWT)
 * @param queryParams - Pagination, sorting, and filtering parameters
 * @returns Paginated paid pursued ideas with details
 */
const getMyPaidPursuedIdeas = async (
    userId: string,
    queryParams: IQueryParams
): Promise<IAccessHistoryResponse> => {
    console.log(userId,"here is the userid");
    try {
        const accessModel = prisma.access as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        // Set default sorting by most recent access
        if (!queryParams.sortBy) {
            queryParams.sortBy = "createdAt";
            queryParams.sortOrder = "desc";
        }

        const accessQueryBuilder = new QueryBuilder(accessModel, queryParams, {
            filterableFields: ["ideaId"],
        });

        const result = await accessQueryBuilder
            .where({ userId })
            .include({
                idea: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        problemStatement: true,
                        solution: true,
                        image: true,
                        attachments: true,
                        isPaid: true,
                        price: true,
                        status: true,
                        feedback: true,
                        isFeatured: true,
                        authorId: true,
                        categoryId: true,
                        positiveRatio: true,
                        totalUpVotes: true,
                        totalDownVotes: true,
                        createdAt: true,
                        updatedAt: true,
                        isDeleted: true,
                        deletedAt: true,
                        author: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        },
                        category: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                }
            })
            .paginate()
            .sort()
            .execute();

            console.log(result)

        // Filter only paid ideas
        const paidIdeas = result.data.filter((access) => (access as IAccessRecord).idea?.isPaid === true);

        return {
            data: paidIdeas as IAccessRecord[],
            meta: {
                ...result.meta,
                total: paidIdeas.length,
            },
        };
    } catch (error) {
        console.error("Failed to retrieve paid pursued ideas:", error);
        throw new AppError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Failed to retrieve paid pursued ideas"
        );
    }
};

export const accessService = {
    checkMyAccessToIdea,
    getMyPaidPursuedIdeas,
};
