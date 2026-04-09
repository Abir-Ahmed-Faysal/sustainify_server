# Sustainify API Quick Reference

## All Endpoints Summary

### Auth (5 endpoints)
- POST /auth/register
- POST /auth/login
- GET /auth/me
- POST /auth/refresh-token
- POST /auth/logout

### Ideas (16+ endpoints)
- GET /ideas (public)
- GET /ideas/admin/all (admin)
- GET /ideas/search/suggestions
- GET /ideas/recommendations/personalized
- GET /ideas/my-ideas
- GET /ideas/my-Idea/:id
- GET /ideas/:id
- POST /ideas
- PATCH /ideas/:id
- PATCH /ideas/status/:id (user status change)
- PATCH /ideas/status/admin/:id (admin status change with feedback)
- PATCH /ideas/toggle-isFeatured/:id (admin)
- DELETE /ideas/:id
- GET /ideas/admin (admin list)
- GET /ideas/admin/:id
- PATCH /ideas/admin/:id/status
- PATCH /ideas/admin/:id/featured
- PATCH /ideas/admin/:id
- DELETE /ideas/admin/:id

### Blog (6 endpoints)
- GET /blogs
- GET /blogs/:id
- GET /blogs/slug/:slug
- POST /blogs (admin)
- PATCH /blogs/:id (admin)
- DELETE /blogs/:id (admin)

### Category (4 endpoints)
- GET /categories
- POST /categories (admin)
- PATCH /categories/:id (admin)
- DELETE /categories/:id (admin)

### Comments (4 endpoints)
- POST /comments
- GET /comments/idea/:ideaId
- PATCH /comments/:id
- DELETE /comments/:id

### Vote (1 endpoint)
- POST /votes (toggle up/downvote)

### Favourite (2 endpoints)
- POST /favourites (toggle)
- GET /favourites/my-favourites

### Payment (2 endpoints)
- POST /payment/create-checkout-session
- POST /payment/webhook (Stripe)

### Profile (2 endpoints)
- PATCH /profile (update profile)
- PATCH /profile/theme (update theme)

### User (5 endpoints)
- GET /users (admin - all users)
- GET /users/public
- GET /users/:id
- PATCH /users/update-profile
- PATCH /users/:id/toggle-status (admin)

### Admin (3 endpoints)
- PATCH /admin/users/:id/role
- PATCH /admin/users/:id/status
- DELETE /admin/users/:id

### Access (2 endpoints)
- GET /access/:ideaId (check access)
- GET /access/my (get purchased ideas)

### Stats (1 endpoint)
- GET /stats (dashboard stats)

### Contact (6 endpoints)
- POST /contact (public)
- GET /contact (admin)
- GET /contact/stats/unread (admin)
- GET /contact/:id (admin)
- PATCH /contact/:id/read (admin)
- DELETE /contact/:id (admin)

## Total: 69+ API Endpoints

## Key Response Format
```javascript
{
  success: boolean,
  message: string,
  data: any,
  meta?: { page, limit, total, totalPages },
  statusCode?: number
}
```

## Authentication
- Access Token: JWT, 1 hour expiry
- Refresh Token: JWT, 7 days expiry
- Sent via: Bearer header or cookies

## Database Enums
- Role: ADMIN | MEMBER
- IdeaStatus: DRAFT | UNDER_REVIEW | APPROVED | REJECTED
- VoteType: UP | DOWN
- PaymentStatus: PAID | UNPAID
