# Sustainify Backend API - Complete Endpoint Documentation

**Base URL:** `/api/v1`  
**Last Updated:** April 2026

---

## Table of Contents
1. [Authentication Module](#authentication-module)
2. [Idea Module](#idea-module)
3. [Blog Module](#blog-module)
4. [Category Module](#category-module)
5. [Comment Module](#comment-module)
6. [Vote Module](#vote-module)
7. [Favourite Module](#favourite-module)
8. [Payment Module](#payment-module)
9. [Profile Module](#profile-module)
10. [User Module](#user-module)
11. [Admin Module](#admin-module)
12. [Access Module](#access-module)
13. [Stats Module](#stats-module)
14. [Contact Module](#contact-module)

---

## Authentication Module

**Base Path:** `/auth`

### 1. Register User
- **Endpoint:** `POST /auth/register`
- **Access:** Public
- **Description:** Create a new user account

**Request Body:**
```typescript
{
  name: string (3-40 characters),
  email: string (valid email format),
  password: string (min 8 chars, must contain uppercase, lowercase, digit, special char)
}
```

**Response (Success - 201 CREATED):**
```typescript
{
  success: true,
  message: "User registered successfully",
  data: {
    accessToken: string,
    refreshToken: string,
    user: {
      id: string (UUID),
      name: string,
      email: string,
      role: "ADMIN" | "MEMBER",
      isActive: boolean,
      isDeleted: boolean,
      createdAt: Date,
      updatedAt: Date
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `409 Conflict` - Email already exists

---

### 2. Login User
- **Endpoint:** `POST /auth/login`
- **Access:** Public
- **Description:** Authenticate user and get tokens

**Request Body:**
```typescript
{
  email: string,
  password: string
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Login successfully",
  data: {
    accessToken: string,
    refreshToken: string,
    user: {
      id: string,
      name: string,
      email: string,
      role: "ADMIN" | "MEMBER",
      isActive: boolean,
      isDeleted: boolean,
      createdAt: Date,
      updatedAt: Date
    }
  }
}
```

**Cookies Set:**
- `accessToken` - JWT token (1h expiry)
- `refreshToken` - JWT token (7d expiry)

---

### 3. Get Current User
- **Endpoint:** `GET /auth/me`
- **Access:** Authenticated users (any role)
- **Description:** Retrieve current logged-in user details

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "User data retrieved successfully",
  data: {
    id: string,
    name: string,
    email: string,
    role: "ADMIN" | "MEMBER",
    isActive: boolean,
    isDeleted: boolean,
    themePreference: "light" | "dark",
    createdAt: Date,
    updatedAt: Date,
    profile: {
      id: string,
      userId: string,
      avatar?: string,
      bio?: string,
      address?: string
    }
  }
}
```

---

### 4. Refresh Token
- **Endpoint:** `POST /auth/refresh-token`
- **Access:** Authenticated users
- **Description:** Generate new access token using refresh token

**Request:**
- Requires valid `refreshToken` in cookies

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Token refreshed successfully",
  data: {
    accessToken: string,
    refreshToken: string
  }
}
```

**Cookies Set:**
- `accessToken` - New JWT token
- `refreshToken` - New JWT token

---

### 5. Logout
- **Endpoint:** `POST /auth/logout`
- **Access:** Public
- **Description:** Logout user and clear session

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Logged out successfully"
}
```

**Cookies Cleared:**
- `accessToken`
- `refreshToken`

---

## Idea Module

**Base Path:** `/ideas`

### 1. Get All Ideas (Public)
- **Endpoint:** `GET /ideas`
- **Access:** Public + Optional authentication
- **Description:** Retrieve all approved ideas with pagination and filtering

**Query Parameters:**
```typescript
{
  page?: number (default: 1),
  limit?: number (default: 10),
  searchTerm?: string,
  sortBy?: string (default: "positiveRatio,createdAt"),
  sortOrder?: string (default: "desc,desc"),
  categoryId?: string (UUID),
  categoryName?: string,
  isPaid?: boolean,
  isFeatured?: boolean,
  authorId?: string,
  totalUpVotes?: number,
  price?: number
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Ideas retrieved successfully",
  meta: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  },
  data: [
    {
      id: string,
      title: string,
      problemStatement: string,
      description: string,
      solution: string,
      image?: string,
      isPaid: boolean,
      price?: number,
      status: "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "REJECTED",
      isFeatured: boolean,
      positiveRatio: number,
      totalUpVotes: number,
      totalDownVotes: number,
      attachments: string[],
      createdAt: Date,
      updatedAt: Date,
      author: {
        id: string,
        name: string,
        email: string,
        role: "ADMIN" | "MEMBER",
        profile?: {
          avatar?: string
        }
      },
      category: {
        id: string,
        name: string,
        image?: string
      },
      _count: {
        comments: number,
        votes: number
      }
    }
  ]
}
```

---

### 2. Get Admin All Ideas
- **Endpoint:** `GET /ideas/admin/all`
- **Access:** Admin only
- **Description:** Get all ideas (excluding drafts) for admin dashboard

**Query Parameters:** Same as "Get All Ideas"

**Response:** Same structure as "Get All Ideas"

---

### 3. Search Ideas (AI-Powered)
- **Endpoint:** `GET /ideas/search/suggestions`
- **Access:** Public + Optional authentication
- **Description:** Search ideas with AI ranking

**Query Parameters:**
```typescript
{
  searchTerm?: string,
  limit?: number,
  page?: number
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Search results retrieved successfully",
  data: {
    results: Idea[],
    ranking: {
      searchTerm: string,
      relevanceScores: Record<string, number>
    }
  }
}
```

---

### 4. Get Personalized Recommendations
- **Endpoint:** `GET /ideas/recommendations/personalized`
- **Access:** Public + Optional authentication
- **Description:** Get personalized idea recommendations

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Personalized recommendations retrieved successfully",
  data: Idea[]
}
```

---

### 5. Get My Ideas
- **Endpoint:** `GET /ideas/my-ideas`
- **Access:** Authenticated (MEMBER, ADMIN)
- **Description:** Get ideas created by current user

**Query Parameters:**
```typescript
{
  page?: number,
  limit?: number,
  sortBy?: string,
  sortOrder?: string,
  status?: "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "REJECTED"
}
```

**Response:** Same structure as "Get All Ideas"

---

### 6. Get My Idea By ID
- **Endpoint:** `GET /ideas/my-Idea/:id`
- **Access:** Authenticated (MEMBER, ADMIN)
- **Description:** Get single idea owned by current user

**URL Parameters:**
- `id` - Idea UUID

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "My Ideas retrieved successfully",
  data: Idea
}
```

---

### 7. Get Single Idea
- **Endpoint:** `GET /ideas/:id`
- **Access:** Public + Optional authentication
- **Description:** Get idea details by ID (only approved ideas for public users)

**URL Parameters:**
- `id` - Idea UUID

**Response:** Same structure as individual Idea object

---

### 8. Create Idea
- **Endpoint:** `POST /ideas`
- **Access:** Authenticated (MEMBER, ADMIN)
- **Description:** Create new idea (draft status)

**Request Body:**
```typescript
{
  title: string (min 3 chars),
  problemStatement: string (min 10 chars),
  solution: string (min 10 chars),
  description: string (min 10 chars),
  image?: string (valid URL),
  price?: number (positive, optional),
  categoryId: string (UUID, required),
  attachments?: string[] (URL array, optional),
  status?: "DRAFT" (only draft allowed on creation)
}
```

**Response (Success - 201 CREATED):**
```typescript
{
  success: true,
  message: "Idea created successfully",
  data: Idea
}
```

---

### 9. Update Idea
- **Endpoint:** `PATCH /ideas/:id`
- **Access:** Authenticated (MEMBER - owner, ADMIN)
- **Description:** Update idea details

**URL Parameters:**
- `id` - Idea UUID

**Request Body:**
```typescript
{
  title?: string,
  problemStatement?: string,
  solution?: string,
  description?: string,
  image?: string (URL),
  price?: number,
  categoryId?: string (UUID),
  attachments?: string[]
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Idea updated successfully",
  data: Idea
}
```

---

### 10. Update Idea Status (User)
- **Endpoint:** `PATCH /ideas/status/:id`
- **Access:** Authenticated (MEMBER - owner, ADMIN)
- **Description:** Change idea status to UNDER_REVIEW or DRAFT

**URL Parameters:**
- `id` - Idea UUID

**Request Body:**
```typescript
{
  status: "UNDER_REVIEW" | "DRAFT"
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Idea status updated successfully",
  data: Idea
}
```

---

### 11. Update Idea Status (Admin)
- **Endpoint:** `PATCH /ideas/status/admin/:id`
- **Access:** Admin only
- **Description:** Admin can change idea status and add feedback

**URL Parameters:**
- `id` - Idea UUID

**Request Body:**
```typescript
{
  status: "APPROVED" | "REJECTED" | "UNDER_REVIEW",
  feedback?: string (required if status is REJECTED)
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Idea status updated successfully",
  data: Idea
}
```

---

### 12. Toggle Featured Status
- **Endpoint:** `PATCH /ideas/toggle-isFeatured/:id`
- **Access:** Admin only
- **Description:** Toggle featured status of an idea

**URL Parameters:**
- `id` - Idea UUID

**Request Body:**
```typescript
{
  isFeatured: boolean
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Idea featured/unfeatured successfully",
  data: Idea
}
```

---

### 13. Delete Idea
- **Endpoint:** `DELETE /ideas/:id`
- **Access:** Authenticated (MEMBER - owner, ADMIN)
- **Description:** Soft delete idea

**URL Parameters:**
- `id` - Idea UUID

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Idea deleted successfully",
  data: Idea
}
```

---

## Blog Module

**Base Path:** `/blogs`

### 1. Get All Blogs
- **Endpoint:** `GET /blogs`
- **Access:** Public
- **Description:** Retrieve all published blogs with pagination

**Query Parameters:**
```typescript
{
  page?: number,
  limit?: number,
  sortBy?: string,
  sortOrder?: string,
  searchTerm?: string
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Blogs fetched successfully",
  meta: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  },
  data: [
    {
      id: string,
      title: string,
      slug: string,
      content: string,
      image?: string,
      isPublished: boolean,
      authorId: string,
      createdAt: Date,
      updatedAt: Date
    }
  ]
}
```

---

### 2. Get Blog By ID
- **Endpoint:** `GET /blogs/:id`
- **Access:** Public
- **Description:** Get single blog by ID

**URL Parameters:**
- `id` - Blog UUID

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Blog fetched successfully",
  data: Blog
}
```

---

### 3. Get Blog By Slug
- **Endpoint:** `GET /blogs/slug/:slug`
- **Access:** Public
- **Description:** Get single blog by slug

**URL Parameters:**
- `slug` - Blog slug (URL-friendly identifier)

**Response:** Same as Get Blog By ID

---

### 4. Create Blog
- **Endpoint:** `POST /blogs`
- **Access:** Admin only
- **Description:** Create new blog post

**Request Body:**
```typescript
{
  title: string (min 3, max 200 chars),
  content: string (min 10, max 5000 chars),
  image?: string (valid URL),
  isPublished?: boolean (default: true)
}
```

**Response (Success - 201 CREATED):**
```typescript
{
  success: true,
  message: "Blog created successfully",
  data: Blog
}
```

---

### 5. Update Blog
- **Endpoint:** `PATCH /blogs/:id`
- **Access:** Admin only
- **Description:** Update blog post

**URL Parameters:**
- `id` - Blog UUID

**Request Body:**
```typescript
{
  title?: string,
  content?: string,
  image?: string,
  isPublished?: boolean
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Blog updated successfully",
  data: Blog
}
```

---

### 6. Delete Blog
- **Endpoint:** `DELETE /blogs/:id`
- **Access:** Admin only
- **Description:** Delete blog post

**URL Parameters:**
- `id` - Blog UUID

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Blog deleted successfully",
  data: Blog
}
```

---

## Category Module

**Base Path:** `/categories`

### 1. Get All Categories
- **Endpoint:** `GET /categories`
- **Access:** Public
- **Description:** Get all categories

**Query Parameters:**
```typescript
{
  page?: number,
  limit?: number,
  sortBy?: string,
  sortOrder?: string,
  searchTerm?: string
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Categories retrieved successfully",
  meta: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  },
  data: [
    {
      id: string,
      name: string,
      image?: string,
      createdAt: Date,
      updatedAt: Date
    }
  ]
}
```

---

### 2. Create Category
- **Endpoint:** `POST /categories`
- **Access:** Admin only
- **Description:** Create new category

**Request Body:**
```typescript
{
  name: string (min 3 chars, unique),
  image?: string (valid URL)
}
```

**Response (Success - 201 CREATED):**
```typescript
{
  success: true,
  message: "Category created successfully",
  data: Category
}
```

---

### 3. Update Category
- **Endpoint:** `PATCH /categories/:id`
- **Access:** Admin only
- **Description:** Update category

**URL Parameters:**
- `id` - Category UUID

**Request Body:**
```typescript
{
  name?: string,
  image?: string
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Category updated successfully",
  data: Category
}
```

---

### 4. Delete Category
- **Endpoint:** `DELETE /categories/:id`
- **Access:** Admin only
- **Description:** Delete category

**URL Parameters:**
- `id` - Category UUID

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Category deleted successfully",
  data: Category
}
```

---

## Comment Module

**Base Path:** `/comments`

### 1. Create Comment
- **Endpoint:** `POST /comments`
- **Access:** Authenticated (MEMBER, ADMIN)
- **Description:** Create comment on an idea

**Request Body:**
```typescript
{
  content: string (1-1000 chars),
  ideaId: string (UUID),
  parentId?: string (UUID, for nested replies)
}
```

**Response (Success - 201 CREATED):**
```typescript
{
  success: true,
  message: "Comment created successfully",
  data: {
    id: string,
    content: string,
    userId: string,
    ideaId: string,
    parentId?: string,
    createdAt: Date,
    updatedAt: Date
  }
}
```

---

### 2. Get Comments By Idea
- **Endpoint:** `GET /comments/idea/:ideaId`
- **Access:** Public
- **Description:** Get all comments for an idea

**URL Parameters:**
- `ideaId` - Idea UUID

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Comments retrieved successfully",
  data: Comment[]
}
```

---

### 3. Update Comment
- **Endpoint:** `PATCH /comments/:id`
- **Access:** Authenticated (comment owner, ADMIN)
- **Description:** Update comment content

**URL Parameters:**
- `id` - Comment UUID

**Request Body:**
```typescript
{
  content: string (1-1000 chars)
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Comment updated successfully",
  data: Comment
}
```

---

### 4. Delete Comment
- **Endpoint:** `DELETE /comments/:id`
- **Access:** Authenticated (comment owner, ADMIN)
- **Description:** Delete comment

**URL Parameters:**
- `id` - Comment UUID

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Comment deleted successfully",
  data: Comment
}
```

---

## Vote Module

**Base Path:** `/votes`

### 1. Toggle Vote (Upvote/Downvote)
- **Endpoint:** `POST /votes`
- **Access:** Authenticated (MEMBER, ADMIN)
- **Description:** Upvote or downvote an idea (toggles if same vote type exists)

**Request Body:**
```typescript
{
  ideaId: string (UUID),
  type: "UP" | "DOWN"
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Vote recorded successfully" | "Vote removed successfully",
  data: {
    id: string,
    userId: string,
    ideaId: string,
    type: "UP" | "DOWN",
    action: "ADDED" | "REMOVED" | "UPDATED"
  }
}
```

---

## Favourite Module

**Base Path:** `/favourites`

### 1. Toggle Favourite
- **Endpoint:** `POST /favourites`
- **Access:** Authenticated (MEMBER, ADMIN)
- **Description:** Add or remove idea from favorites

**Request Body:**
```typescript
{
  ideaId: string (UUID)
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Added to favorites successfully" | "Removed from favorites successfully",
  data: {
    id: string,
    userId: string,
    ideaId: string,
    action: "ADDED" | "REMOVED"
  }
}
```

---

### 2. Get My Favourites
- **Endpoint:** `GET /favourites/my-favourites`
- **Access:** Authenticated (MEMBER, ADMIN)
- **Description:** Get all favorite ideas of current user

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Favorites retrieved successfully",
  data: Idea[]
}
```

---

## Payment Module

**Base Path:** `/payment`

### 1. Create Checkout Session
- **Endpoint:** `POST /payment/create-checkout-session`
- **Access:** Authenticated (MEMBER, ADMIN)
- **Description:** Create Stripe checkout session for idea purchase

**Request Body:**
```typescript
{
  ideaId: string (UUID)
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Checkout session created successfully",
  data: {
    sessionId: string,
    clientSecret: string,
    amount: number,
    currency: string,
    idea: {
      id: string,
      title: string,
      price: number
    }
  }
}
```

---

### 2. Stripe Webhook
- **Endpoint:** `POST /payment/webhook`
- **Access:** Stripe (signature verification)
- **Description:** Handle Stripe webhook events (payment.intent.succeeded, etc.)

**Headers:**
- `stripe-signature` - Stripe signature for verification

**Request Body:** Stripe webhook event (raw)

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Webhook processed successfully",
  data: {
    eventId: string,
    eventType: string,
    processed: boolean
  }
}
```

---

## Profile Module

**Base Path:** `/profile`

### 1. Update Profile
- **Endpoint:** `PATCH /profile`
- **Access:** Authenticated (any user)
- **Description:** Update personal profile information

**Request Body:**
```typescript
{
  name?: string (max 100 chars),
  avatar?: string (valid URL),
  bio?: string (max 500 chars),
  address?: string (max 255 chars),
  themePreference?: "light" | "dark"
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Profile updated successfully",
  data: {
    id: string,
    userId: string,
    name?: string,
    avatar?: string,
    bio?: string,
    address?: string
  }
}
```

---

### 2. Update Theme Preference
- **Endpoint:** `PATCH /profile/theme`
- **Access:** Authenticated (any user)
- **Description:** Update theme preference

**Request Body:**
```typescript
{
  themePreference: "light" | "dark"
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Theme preference updated successfully",
  data: {
    id: string,
    themePreference: "light" | "dark"
  }
}
```

---

## User Module

**Base Path:** `/users`

### 1. Get All Users (Admin)
- **Endpoint:** `GET /users`
- **Access:** Admin only
- **Description:** Get paginated list of all users

**Query Parameters:**
```typescript
{
  page?: number,
  limit?: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string,
  isActive?: boolean,
  role?: "ADMIN" | "MEMBER"
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Users retrieved successfully",
  meta: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  },
  data: [
    {
      id: string,
      name: string,
      email: string,
      role: "ADMIN" | "MEMBER",
      isActive: boolean,
      createdAt: Date,
      updatedAt: Date
    }
  ]
}
```

---

### 2. Get Public Users
- **Endpoint:** `GET /users/public`
- **Access:** Public
- **Description:** Get limited public user information for filters

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Public users retrieved successfully",
  data: [
    {
      id: string,
      name: string,
      profile?: {
        avatar?: string
      }
    }
  ]
}
```

---

### 3. Get User By ID
- **Endpoint:** `GET /users/:id`
- **Access:** Authenticated (MEMBER, ADMIN)
- **Description:** Get specific user details

**URL Parameters:**
- `id` - User UUID

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "User retrieved successfully",
  data: {
    id: string,
    name: string,
    email: string,
    role: "ADMIN" | "MEMBER",
    isActive: boolean,
    profile: Profile,
    createdAt: Date,
    updatedAt: Date
  }
}
```

---

### 4. Update My Profile
- **Endpoint:** `PATCH /users/update-profile`
- **Access:** Authenticated (MEMBER, ADMIN)
- **Description:** Update own user profile

**Request Body:**
```typescript
{
  name?: string,
  bio?: string,
  avatar?: string (valid URL or empty string),
  address?: string
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Profile updated successfully",
  data: User
}
```

---

### 5. Toggle User Status (Admin)
- **Endpoint:** `PATCH /users/:id/toggle-status`
- **Access:** Admin only
- **Description:** Activate/deactivate user account

**URL Parameters:**
- `id` - User UUID

**Request Body:**
```typescript
{
  isActive: boolean
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "User status updated successfully",
  data: User
}
```

---

## Admin Module

**Base Path:** `/admin`

### 1. Update User Role
- **Endpoint:** `PATCH /admin/users/:id/role`
- **Access:** Admin only
- **Description:** Change user role (ADMIN/MEMBER)

**URL Parameters:**
- `id` - User UUID

**Request Body:**
```typescript
{
  role: "ADMIN" | "MEMBER"
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "User role updated successfully",
  data: User
}
```

---

### 2. Toggle User Status
- **Endpoint:** `PATCH /admin/users/:id/status`
- **Access:** Admin only
- **Description:** Activate/deactivate user account

**URL Parameters:**
- `id` - User UUID

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "User activated/deactivated successfully",
  data: {
    id: string,
    isActive: boolean,
    ...
  }
}
```

---

### 3. Delete User
- **Endpoint:** `DELETE /admin/users/:id`
- **Access:** Admin only
- **Description:** Permanently delete user account

**URL Parameters:**
- `id` - User UUID

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "User deleted successfully"
}
```

---

## Idea Admin Routes

**Base Path:** `/ideas/admin`

### 1. Get All Ideas (Admin)
- **Endpoint:** `GET /ideas/admin`
- **Access:** Admin only
- **Description:** Get all ideas in admin view

**Query Parameters:** Same as public ideas endpoint

**Response:** Same as public ideas listing

---

### 2. Get Idea By ID (Admin)
- **Endpoint:** `GET /ideas/admin/:id`
- **Access:** Admin only
- **Description:** Get idea details for admin

**URL Parameters:**
- `id` - Idea UUID

**Response:** Same as get single idea

---

### 3. Change Idea Status (Admin)
- **Endpoint:** `PATCH /ideas/admin/:id/status`
- **Access:** Admin only
- **Description:** Change idea status with feedback

**URL Parameters:**
- `id` - Idea UUID

**Request Body:**
```typescript
{
  status: "APPROVED" | "REJECTED" | "UNDER_REVIEW",
  feedback?: string (required if REJECTED)
}
```

**Response:** Idea object with updated status

---

### 4. Toggle Feature Status (Admin)
- **Endpoint:** `PATCH /ideas/admin/:id/featured`
- **Access:** Admin only
- **Description:** Toggle featured flag

**URL Parameters:**
- `id` - Idea UUID

**Request Body:**
```typescript
{
  isFeatured: boolean
}
```

**Response:** Updated Idea object

---

### 5. Update Idea (Admin)
- **Endpoint:** `PATCH /ideas/admin/:id`
- **Access:** Admin only
- **Description:** Update any idea as admin

**URL Parameters:**
- `id` - Idea UUID

**Request Body:** All updateable idea fields

**Response:** Updated Idea object

---

### 6. Delete Idea (Admin)
- **Endpoint:** `DELETE /ideas/admin/:id`
- **Access:** Admin only
- **Description:** Delete idea as admin

**URL Parameters:**
- `id` - Idea UUID

**Response:** Deleted Idea object

---

## Access Module

**Base Path:** `/access`

### 1. Check My Access to Idea
- **Endpoint:** `GET /access/:ideaId`
- **Access:** Public + Optional authentication
- **Description:** Check if current user has access to a specific idea

**URL Parameters:**
- `ideaId` - Idea UUID

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Your access status retrieved",
  data: boolean // true if user has access, false otherwise
}
```

---

### 2. Get My Paid Pursued Ideas
- **Endpoint:** `GET /access/my` 
- **Endpoint:** `GET /ideas/my-purchased-ideas`
- **Access:** Authenticated (MEMBER, ADMIN)
- **Description:** Get all ideas purchased/accessed by user

**Query Parameters:**
```typescript
{
  page?: number,
  limit?: number,
  sortBy?: string,
  sortOrder?: string
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Your paid pursued ideas retrieved",
  meta: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  },
  data: Idea[]
}
```

---

## Stats Module

**Base Path:** `/stats`

### 1. Get Dashboard Stats
- **Endpoint:** `GET /stats`
- **Access:** Authenticated (MEMBER, ADMIN)
- **Description:** Get dashboard statistics for current user

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "stats data fetch successfully",
  data: {
    // For MEMBER users
    totalIdeas: number,
    totalVotes: number,
    totalComments: number,
    totalFavourites: number,
    totalIdeasUnderReview: number,
    totalIdeasApproved: number,
    totalIdeasRejected: number,
    totalPurchasedIdeas: number,
    
    // For ADMIN users
    totalUsers: number,
    totalActiveUsers: number,
    totalIdeasInSystem: number,
    totalApprovableIdeas: number,
    totalRevenue: number,
    categoryBreakdown: Record<string, number>
  }
}
```

---

## Contact Module

**Base Path:** `/contact`

### 1. Create Contact Message
- **Endpoint:** `POST /contact`
- **Access:** Public
- **Description:** Submit contact form message

**Request Body:**
```typescript
{
  name: string (required),
  email: string (required),
  subject: string (required),
  message: string (required)
}
```

**Response (Success - 201 CREATED):**
```typescript
{
  success: true,
  message: "Contact message created successfully",
  data: {
    id: string,
    name: string,
    email: string,
    subject: string,
    message: string,
    isRead: boolean,
    createdAt: Date
  }
}
```

---

### 2. Get All Contact Messages (Admin)
- **Endpoint:** `GET /contact`
- **Access:** Admin only
- **Description:** Get all contact messages with pagination

**Query Parameters:**
```typescript
{
  page?: number,
  limit?: number,
  search?: string,
  sortBy?: string,
  sortOrder?: string,
  isRead?: boolean
}
```

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Contact messages retrieved successfully",
  meta: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  },
  data: ContactMessage[]
}
```

---

### 3. Get Unread Count (Admin)
- **Endpoint:** `GET /contact/stats/unread`
- **Access:** Admin only
- **Description:** Get count of unread contact messages

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Unread count retrieved",
  data: {
    unreadCount: number
  }
}
```

---

### 4. Get Contact Message (Admin)
- **Endpoint:** `GET /contact/:id`
- **Access:** Admin only
- **Description:** Get single contact message by ID

**URL Parameters:**
- `id` - Contact message UUID

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Contact message retrieved",
  data: ContactMessage
}
```

---

### 5. Mark Message as Read (Admin)
- **Endpoint:** `PATCH /contact/:id/read`
- **Access:** Admin only
- **Description:** Mark contact message as read

**URL Parameters:**
- `id` - Contact message UUID

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Contact message marked as read",
  data: ContactMessage
}
```

---

### 6. Delete Contact Message (Admin)
- **Endpoint:** `DELETE /contact/:id`
- **Access:** Admin only
- **Description:** Delete contact message

**URL Parameters:**
- `id` - Contact message UUID

**Response (Success - 200 OK):**
```typescript
{
  success: true,
  message: "Contact message deleted successfully"
}
```

---

## Standard Error Response Format

All error responses follow this format:

```typescript
{
  success: false,
  message: string (error description),
  statusCode: number (HTTP status code),
  errors?: Record<string, string[]> (validation errors)
}
```

**Common HTTP Status Codes:**
- `200 OK` - Success (GET, PATCH, DELETE)
- `201 CREATED` - Resource created (POST)
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing/invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

## TypeScript Type Definitions

### Core Types

```typescript
// User
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "MEMBER";
  isActive: boolean;
  themePreference: "light" | "dark";
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

// Profile
interface Profile {
  id: string;
  userId: string;
  avatar?: string;
  bio?: string;
  address?: string;
}

// Idea
interface Idea {
  id: string;
  title: string;
  problemStatement: string;
  solution: string;
  description: string;
  image?: string;
  positiveRatio: number;
  totalUpVotes: number;
  totalDownVotes: number;
  attachments: string[];
  isPaid: boolean;
  price?: number;
  status: "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  feedback?: string;
  isFeatured: boolean;
  authorId: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  author: User;
  category: Category;
}

// Blog
interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  image?: string;
  authorId: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

// Category
interface Category {
  id: string;
  name: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

// Comment
interface Comment {
  id: string;
  content: string;
  userId: string;
  ideaId: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  user: User;
  idea: Idea;
  replies?: Comment[];
}

// Vote
interface Vote {
  id: string;
  userId: string;
  ideaId: string;
  type: "UP" | "DOWN";
  user: User;
  idea: Idea;
}

// Favourite
interface Favourite {
  id: string;
  userId: string;
  ideaId: string;
  user: User;
  idea: Idea;
}

// Payment
interface Payment {
  id: string;
  userId: string;
  ideaId: string;
  amount: number;
  status: "PAID" | "UNPAID";
  transactionId: string;
  stripeEventId?: string;
  invoiceUrl?: string;
  paymentGatewayData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  idea: Idea;
}

// Access
interface Access {
  id: string;
  userId: string;
  ideaId: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  idea: Idea;
}

// Session
interface Session {
  id: string;
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Contact
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Authentication Details

### Token Structure

**Access Token (JWT):**
- Expiry: 1 hour
- Payload includes: `id`, `name`, `email`, `role`, `isActive`, `createdAt`, `updatedAt`
- Sent in: `Authorization: Bearer <token>` header or `accessToken` cookie

**Refresh Token (JWT):**
- Expiry: 7 days
- Stored in: `refreshToken` cookie
- Used to generate new access tokens

### Protected Routes

Routes require authentication via the `checkAuth()` middleware:
- Headers must include: `Authorization: Bearer <accessToken>`
- Or cookies must include: `accessToken`

### Role-Based Access Control

**ADMIN Role:**
- Can create/update/delete blogs
- Can manage categories
- Can approve/reject ideas
- Can manage users and their roles
- Can toggle idea featured status
- Can access admin dashboards

**MEMBER Role:**
- Can create/edit their own ideas
- Can vote on ideas
- Can comment on ideas
- Can add ideas to favorites
- Can purchase/access ideas
- Can update their profile

---

**End of Documentation**
