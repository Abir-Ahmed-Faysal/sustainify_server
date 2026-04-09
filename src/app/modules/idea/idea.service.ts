/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IIdeaCreatePayload, IIdeaUpdate } from "./idea.interfaces";
import { IUserRequest } from "../../interfaces/user.interface";
import { IdeaStatus, Role } from "../../../generated/prisma";
import { QueryBuilder } from "../../utilities/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { formatToLocalTime } from "../../utilities/dateTime";


const createIdea = async (user: IUserRequest, payload: IIdeaCreatePayload) => {
  const categoryExists = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!categoryExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
  }

  const price = Number(payload?.price)

  if (price) {
    payload.isPaid = true
  }

  const result = await prisma.idea.create({
    data: {
      ...payload,
      authorId: user.id,
    },
  });
  return result;
};

const getAllIdeas = async (query: IQueryParams) => {
  const ideaModel = prisma.idea as any; // Cast for QueryBuilder compatibility

  // Transform categoryName to category.name for nested filtering
  if (query.categoryName) {
    query["category.name"] = query.categoryName;
    delete query.categoryName;
  }

  // Set professional default sorting if not provided
  if (!query.sortBy) {
    query.sortBy = "positiveRatio,createdAt";
    query.sortOrder = "desc,desc";
  }

  const ideaQueryBuilder = new QueryBuilder(ideaModel, query, {
    searchableFields: ["title", "problemStatement", "description", "author.name"],
    filterableFields: ["categoryId", "isPaid", "status", "authorId", "isFeatured", "category.name", "totalUpVotes", "price"],
  });

  const result = await ideaQueryBuilder
    .search()
    .filter()
    .sort()
    .paginate()
    .where({ isDeleted: false, status: IdeaStatus.APPROVED })
    .include({
      category: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profile: {
            select: {
              avatar: true,
            }
          }
        }
      },
      _count: {
        select: {
          comments: true,
          votes: true,
        }
      }
    })
    .execute();

  // Securely project fields to hide sensitive data in list view
  result.data = result.data.map((idea: any) => ({
    id: idea.id,
    title: idea.title,
    problemStatement: idea.problemStatement,
    description: idea.description,
    image: idea.image,
    isPaid: idea.isPaid,
    price: idea.price,
    status: idea.status,
    isFeatured: idea.isFeatured,
    createdAt: formatToLocalTime(idea.createdAt),
    positiveRatio: idea.positiveRatio,
    totalUpVotes: idea.totalUpVotes,
    totalDownVotes: idea.totalDownVotes,
    author: {
      ...idea.author,
      profile: idea.author.profile ?? undefined,
    },
    category: idea.category,
    attachments: idea.attachments,
    _count: idea._count
  }));

  return result;
};

// ✅ NEW: Admin endpoint - returns ALL ideas (excluding drafts and deleted items)
const getAdminAllIdeas = async (query: IQueryParams) => {
  const ideaModel = prisma.idea as any; // Cast for QueryBuilder compatibility

  // Transform categoryName to category.name for nested filtering
  if (query.categoryName) {
    query["category.name"] = query.categoryName;
    delete query.categoryName;
  }

  // Set professional default sorting if not provided
  if (!query.sortBy) {
    query.sortBy = "createdAt";
    query.sortOrder = "desc";
  }

  const ideaQueryBuilder = new QueryBuilder(ideaModel, query, {
    searchableFields: ["title", "problemStatement", "description", "author.name"],
    filterableFields: ["categoryId", "isPaid", "status", "authorId", "isFeatured", "category.name", "totalUpVotes", "price"],
  });

  const result = await ideaQueryBuilder
    .search()
    .filter()
    .sort()
    .paginate()
    .where({ isDeleted: false, status: { not: IdeaStatus.DRAFT } })
    .include({
      category: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profile: {
            select: {
              avatar: true,
            }
          }
        }
      },
      _count: {
        select: {
          comments: true,
          votes: true,
        }
      }
    })
    .execute();

  // Securely project fields to hide sensitive data in list view
  result.data = result.data.map((idea: any) => ({
    id: idea.id,
    title: idea.title,
    problemStatement: idea.problemStatement,
    description: idea.description,
    image: idea.image,
    isPaid: idea.isPaid,
    price: idea.price,
    status: idea.status,
    isFeatured: idea.isFeatured,
    createdAt: formatToLocalTime(idea.createdAt),
    positiveRatio: idea.positiveRatio,
    totalUpVotes: idea.totalUpVotes,
    totalDownVotes: idea.totalDownVotes,
    author: {
      ...idea.author,
      profile: idea.author.profile ?? undefined,
    },
    category: idea.category,
    attachments: idea.attachments,
    _count: idea._count
  }));

  return result;
};


const getMyIdeas = async (query: IQueryParams, user: IUserRequest) => {
  const ideaModel = prisma.idea as any; // Cast for QueryBuilder compatibility

  // Transform categoryName to category.name for nested filtering
  if (query.categoryName) {
    query["category.name"] = query.categoryName;
    delete query.categoryName;
  }

  // Set professional default sorting if not provided
  if (!query.sortBy) {
    query.sortBy = "positiveRatio,createdAt";
    query.sortOrder = "desc,desc";
  }

  const ideaQueryBuilder = new QueryBuilder(ideaModel, query, {
    searchableFields: ["title", "problemStatement", "description"],
    filterableFields: ["categoryId", "isPaid", "status", "authorId", "isFeatured", "category.name", "totalUpVotes", "price"],
  });

  const result = await ideaQueryBuilder
    .search()
    .filter()
    .sort()
    .paginate()
    .where({ isDeleted: false, authorId: user.id })
    .include({
      category: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profile: {
            select: {
              avatar: true,
            }
          }
        }
      },
      _count: {
        select: {
          comments: true,
          votes: true,
        }
      }
    })
    .execute();

  // Securely project fields to hide sensitive data in list view
  result.data = result.data.map((idea: any) => ({
    id: idea.id,
    title: idea.title,
    problemStatement: idea.problemStatement,
    description: idea.description,
    image: idea.image,
    isPaid: idea.isPaid,
    price: idea.price,
    status: idea.status,
    isFeatured: idea.isFeatured,
    createdAt: formatToLocalTime(idea.createdAt),
    positiveRatio: idea.positiveRatio,
    totalUpVotes: idea.totalUpVotes,
    totalDownVotes: idea.totalDownVotes,
    author: {
      ...idea.author,
      profile: idea.author.profile ?? undefined,
    },
    category: idea.category,
    attachments: idea.attachments,
    _count: idea._count
  }));

  return result;
};


const getMyIdeaById = async (id: string, user: IUserRequest) => {
  const idea = await prisma.idea.findFirst({
    where: { authorId: user.id, id, isDeleted: false },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profile: {
            select: {
              avatar: true,
            },
          },
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          comments: true,
          votes: true,
        },
      },
    },
  });

  if (!idea) {
    throw new AppError(StatusCodes.NOT_FOUND, "idea not found");
  }

  const formattedIdea = {
    ...idea,
    author: idea.author
      ? {
          ...idea.author,
          profile: idea.author.profile ?? undefined,
        }
      : undefined,
    createdAt: formatToLocalTime(idea.createdAt),
    updatedAt: formatToLocalTime(idea.updatedAt),
  };

  return {
    ...formattedIdea,
    unlock: true,
    comment: true,
  };
};


const changeStatus = async (
  id: string,
  user: IUserRequest,
  status: IdeaStatus
) => {

  // Allow members to switch between DRAFT and UNDER_REVIEW
  if (status !== IdeaStatus.UNDER_REVIEW && status !== IdeaStatus.DRAFT) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Members can only set status to DRAFT or UNDER_REVIEW"
    );
  }

  const findIdea = await prisma.idea.findFirstOrThrow({
    where: {
      id,
      isDeleted: false,
      authorId: user.id,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (findIdea.status === IdeaStatus.APPROVED) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Cannot change status of approved ideas"
    );
  }

  if (findIdea.status === status) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "Idea already in this status"
    );
  }

  return prisma.idea.update({
    where: { id },
    data: { status },
  });
};


const changeStatusByAdmin = async (
  id: string,
  user: IUserRequest,
  status: IdeaStatus,
  feedback?: string
) => {

  if (user.role !== Role.ADMIN) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Only admin can change this status"
    );
  }

  if (
    status !== IdeaStatus.APPROVED &&
    status !== IdeaStatus.REJECTED &&
    status !== IdeaStatus.UNDER_REVIEW
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Admin can only approve, reject or review ideas"
    );
  }

  const findIdea = await prisma.idea.findFirstOrThrow({
    where: {
      id,
      isDeleted: false,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (findIdea.status === status) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "Idea already in this status"
    );
  }

  return await prisma.$transaction(async (tx) => {
    const updatedIdea = await tx.idea.update({
      where: { id },
      data: { status, feedback: feedback || null },
    });

    // ✅ If the idea is no longer APPROVED, remove all social interactions
    if (status !== IdeaStatus.APPROVED) {
      await tx.favourite.deleteMany({
        where: { ideaId: id },
      });
      await tx.comment.deleteMany({
        where: { ideaId: id },
      });
    }

    return updatedIdea;
  });
};


export const getIdeaById = async (id: string, user?: IUserRequest) => {
  // Fetch idea with author, category, and counts (remove status filter - check permissions below)
  const idea = await prisma.idea.findFirst({
    where: { id, isDeleted: false },
    include: {
      comments: {
        include: {
          user: {
            select: {
              name: true,
              profile: true
            }
          }
        }
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: {
            select: {
              avatar: true,
            },
          },
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },

      _count: {
        select: {
          comments: true,
          votes: true,
        },
      },
    },
  });

  if (!idea) {
    throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
  }

  // ✅ Permission check: Public users can only see APPROVED ideas
  // Admins and authors can see any status
  const isAdmin = user?.role === Role.ADMIN;
  const isAuthor = user && user.id === idea.authorId;
  const isApproved = idea.status === IdeaStatus.APPROVED;

  if (!isAdmin && !isAuthor && !isApproved) {
    throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
  }

  // Normalize idea to match IIdea interface
  const formatIdea = (item: typeof idea & { author: { profile: { avatar: string | null } | null } }) => ({
    ...item,
    author: {
      ...item.author,
      profile: item.author.profile ?? undefined, // Convert null → undefined for TypeScript
    },
    createdAt: formatToLocalTime(item.createdAt),
    updatedAt: formatToLocalTime(item.updatedAt),
  });

  // 1. Admins see full content
  if (isAdmin) {
    return { ...formatIdea(idea), unlock: true, comment: true };
  }

  // 2. Authors see full content (their own idea)
  if (isAuthor) {
    return { ...formatIdea(idea), unlock: true, comment: true };
  }

  // 3. Free idea → return full content
  if (!idea.isPaid) {
    return { ...formatIdea(idea), unlock: true, comment: true };
  }

  // 4. Paid idea → check if user has purchased
  let isPurchased = false;
  if (user) {
    const purchase = await prisma.access.findUnique({
      where: {
        userId_ideaId: {
          userId: user.id,
          ideaId: id,
        },
      },
    });
    if (purchase) isPurchased = true;
  }

  if (isPurchased) {
    return { ...formatIdea(idea), unlock: true, comment: true };
  }

  // 4. Not purchased → return partial preview (with necessary fields for preview UI)
  // Note: 'solution' field is intentionally omitted to indicate partial data on client
  return {
    id: idea.id,
    title: idea.title,
    problemStatement: idea.problemStatement,
    description: idea.description.substring(0, 100) + "...", // Short preview
    image: idea.image,
    isPaid: idea.isPaid,
    price: idea.price,
    status: idea.status,
    isFeatured: idea.isFeatured,
    positiveRatio: idea.positiveRatio,
    totalUpVotes: idea.totalUpVotes,
    totalDownVotes: idea.totalDownVotes,
    unlock: false,
    comment: false,
    author: {
      ...idea.author,
      profile: idea.author.profile ?? undefined,
    },
    category: idea.category,
    createdAt: formatToLocalTime(idea.createdAt),
    updatedAt: formatToLocalTime(idea.updatedAt),
    _count: idea._count,

  };
};

const updateIdea = async (id: string, user: IUserRequest, payload: IIdeaUpdate) => {

  const idea = await prisma.idea.findFirst({
    where: { id, isDeleted: false },
  });

  if (!idea) {
    throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
  }

  // Only the author or an ADMIN can update the idea
  if (idea.authorId !== user.id && user.role !== Role.ADMIN) {
    throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized to update this idea");
  }

  // ⚠️  Members can only edit unpublished and non-rejected ideas (UNDER_REVIEW or DRAFT)
  // Admins can edit any non-deleted idea
  if (user.role !== Role.ADMIN && (idea.status === IdeaStatus.APPROVED || idea.status === IdeaStatus.REJECTED)) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      `Cannot edit ${idea.status.toLowerCase()} ideas.`
    );
  }

  const result = await prisma.idea.update({
    where: { id },
    data: payload,
  });
  return result;
};


const deleteIdea = async (id: string, user: IUserRequest) => {
  // Find the idea
  const idea = await prisma.idea.findUnique({
    where: { id },
  });

  if (!idea || idea.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "Idea not found");
  }

  // Only the author or an admin can delete
  if (idea.authorId !== user.id && user.role !== Role.ADMIN) {
    throw new AppError(StatusCodes.FORBIDDEN, "You are not authorized to delete this idea");
  }

  // ⚠️  Members can only delete unpublished and non-rejected ideas (UNDER_REVIEW or DRAFT)
  // Admins can delete any idea
  if (user.role !== Role.ADMIN && (idea.status === IdeaStatus.APPROVED || idea.status === IdeaStatus.REJECTED)) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      `Cannot delete ${idea.status.toLowerCase()} ideas.`
    );
  }

  // ✅ Use transaction to handle soft delete and activity cleanup
  return await prisma.$transaction(async (tx) => {
    const result = await tx.idea.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Clear all associated social data
    await tx.favourite.deleteMany({
      where: { ideaId: id },
    });
    await tx.comment.deleteMany({
      where: { ideaId: id },
    });

    return result;
  });
};


const toggleIsFeatured = async (
  ideaId: string,
  user: IUserRequest,
  payload: { isFeatured: boolean }
) => {

  // ✅ Only Admin
  if (user.role !== Role.ADMIN) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Only admin can feature an idea"
    );
  }

  // ✅ Check idea exists
  const idea = await prisma.idea.findFirst({
    where: {
      id: ideaId,
      isDeleted: false,
    },
    select: {
      id: true,
      title: true,
      isFeatured: true,
    },
  });

  if (!idea) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Idea not found"
    );
  }

  // ✅ Update isFeatured
  const updatedIdea = await prisma.idea.update({
    where: { id: ideaId },
    data: { isFeatured: payload.isFeatured },
  });

  return updatedIdea;
};

// AI Search - Returns relevant ideas with ranking based on search query
const searchIdeas = async (query: IQueryParams) => {
  const searchQuery = (query.search || "").toLowerCase();
  const limit = parseInt(String(query.limit || 10));
  const page = parseInt(String(query.page || 1));
  const skip = (page - 1) * limit;

  // Get all approved ideas
  const ideas = await prisma.idea.findMany({
    where: {
      isDeleted: false,
      status: IdeaStatus.APPROVED,
    },
    include: {
      category: { select: { id: true, name: true, image: true } },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          profile: { select: { avatar: true } },
        },
      },
      _count: { select: { votes: true, comments: true } },
    },
  });

  // Calculate relevance scores
  const rankedIdeas = ideas
    .map((idea: any) => ({
      ...idea,
      relevanceScore: calculateRelevance(idea, searchQuery),
    }))
    .filter((idea) => idea.relevanceScore > 0) // Only ideas matching search
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(skip, skip + limit);

  return rankedIdeas;
};

// AI Recommendations - Returns personalized ideas based on user interests
const getRecommendations = async (user: IUserRequest | undefined) => {
  // Return popular ideas if not authenticated
  if (!user?.id) {
    return await prisma.idea.findMany({
      where: {
        isDeleted: false,
        status: IdeaStatus.APPROVED,
      },
      include: {
        category: { select: { id: true, name: true, image: true } },
        author: {
          select: {
            id: true,
            name: true,
            profile: { select: { avatar: true } },
          },
        },
        _count: { select: { votes: true, comments: true } },
      },
      orderBy: [{ totalUpVotes: "desc" }, { createdAt: "desc" }],
      take: 10,
    });
  }

  // Get user's voting history to identify interests
  const userVotes = await prisma.vote.findMany({
    where: { userId: user.id, isUpvote: true },
    include: { idea: { select: { categoryId: true } } },
    take: 50,
  });

  // Get favorite ideas
  const favoriteIdeas = await prisma.favourite.findMany({
    where: { userId: user.id },
    include: { idea: { select: { categoryId: true } } },
    take: 20,
  });

  // Extract interested categories
  const interestedCategories = [
    ...new Set([
      ...favoriteIdeas.map((f) => f.idea?.categoryId).filter(Boolean),
      ...userVotes.map((v) => v.idea?.categoryId).filter(Boolean),
    ]),
  ];

  // Get recommended ideas from interested categories
  const recommendations = await prisma.idea.findMany({
    where: {
      isDeleted: false,
      status: IdeaStatus.APPROVED,
      ...(interestedCategories.length > 0 && {
        categoryId: { in: interestedCategories as string[] },
      }),
    },
    include: {
      category: { select: { id: true, name: true, image: true } },
      author: {
        select: {
          id: true,
          name: true,
          profile: { select: { avatar: true } },
        },
      },
      _count: { select: { votes: true, comments: true } },
    },
    orderBy: [{ totalUpVotes: "desc" }, { createdAt: "desc" }],
    take: 10,
  });

  return recommendations.length > 0
    ? recommendations
    : // Fallback to popular ideas if no personalized recommendations
      await prisma.idea.findMany({
        where: {
          isDeleted: false,
          status: IdeaStatus.APPROVED,
        },
        include: {
          category: { select: { id: true, name: true, image: true } },
          author: {
            select: {
              id: true,
              name: true,
              profile: { select: { avatar: true } },
            },
          },
          _count: { select: { votes: true, comments: true } },
        },
        orderBy: [{ totalUpVotes: "desc" }, { createdAt: "desc" }],
        take: 10,
      });
};

// Helper function to calculate relevance score
const calculateRelevance = (idea: any, searchQuery: string): number => {
  if (!searchQuery) return 0;

  const query = searchQuery.toLowerCase();
  let score = 0;

  // Exact title match (highest priority)
  if (idea.title?.toLowerCase() === query) score += 100;
  // Title contains query
  else if (idea.title?.toLowerCase().includes(query)) score += 50;

  // Word match in title
  if (idea.title?.toLowerCase().split(" ").some((word: string) => word.startsWith(query)))
    score += 25;

  // Problem statement match
  if (idea.problemStatement?.toLowerCase().includes(query)) score += 10;

  // Description match
  if (idea.description?.toLowerCase().includes(query)) score += 5;

  // Category match
  if (idea.category?.name?.toLowerCase().includes(query)) score += 15;

  // Author name match
  if (idea.author?.name?.toLowerCase().includes(query)) score += 8;

  // Boost by votes (popular ideas ranked higher)
  score += (idea.totalUpVotes || 0) * 0.5;

  return score;
};


export const ideaService = {
  changeStatus,
  createIdea,
  getAllIdeas,
  getAdminAllIdeas,
  getIdeaById,
  updateIdea,
  deleteIdea,
  getMyIdeas,
  getMyIdeaById,
  changeStatusByAdmin,
  toggleIsFeatured,
  searchIdeas,
  getRecommendations,
};
