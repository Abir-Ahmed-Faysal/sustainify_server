/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IBlogCreatePayload, IBlogUpdatePayload } from "./blog.interface";
import { QueryBuilder } from "../../utilities/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { IUserRequest } from "../../interfaces/user.interface";

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

const createBlog = async (user: IUserRequest, payload: IBlogCreatePayload) => {
  const slug = slugify(payload.title);

  // Check if slug already exists
  const isExist = await prisma.blog.findUnique({
    where: { slug },
  });

  if (isExist) {
    // If slug exists, append random suffix or timestamp
    payload.slug = `${slug}-${Date.now()}`;
  } else {
    payload.slug = slug;
  }

  const result = await prisma.blog.create({
    data: {
      ...payload,
      authorId: user.id,
    },
  });
  return result;
};

const getAllBlogs = async (query: IQueryParams) => {
  const blogModel = prisma.blog as any;

  const blogQueryBuilder = new QueryBuilder(blogModel, query, {
    searchableFields: ["title", "content"],
    filterableFields: ["authorId", "isPublished"],
  });

  const result = await blogQueryBuilder
    .search()
    .filter()
    .sort()
    .paginate()
    .where({ isDeleted: false, isPublished: true })
    .include({
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
    })
    .execute();

  return result;
};

const getBlogById = async (id: string) => {
  const result = await prisma.blog.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
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
    },
  });

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "Blog not found");
  }

  return result;
};

const getBlogBySlug = async (slug: string) => {
    const result = await prisma.blog.findUnique({
      where: {
        slug,
        isDeleted: false,
      },
      include: {
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
      },
    });
  
    if (!result) {
      throw new AppError(StatusCodes.NOT_FOUND, "Blog not found");
    }
  
    return result;
  };

const updateBlog = async (id: string, payload: IBlogUpdatePayload) => {
  const blog = await prisma.blog.findUnique({
    where: { id, isDeleted: false },
  });

  if (!blog) {
    throw new AppError(StatusCodes.NOT_FOUND, "Blog not found");
  }

  if (payload.title) {
    payload.slug = slugify(payload.title);
  }

  const result = await prisma.blog.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteBlog = async (id: string) => {
  const blog = await prisma.blog.findUnique({
    where: { id },
  });

  if (!blog || blog.isDeleted) {
    throw new AppError(StatusCodes.NOT_FOUND, "Blog not found");
  }

  const result = await prisma.blog.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });

  return result;
};

export const BlogService = {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
};
