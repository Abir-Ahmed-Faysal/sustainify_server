# **EcoSpark Hub Assignment Requirements (Clean Version)**

## **Project Overview**

Develop an online community portal where community members can share sustainably oriented ideas (e.g. reducing plastic consumption or launching a solar power project) to help the environment. Admins monitor submissions, provide feedback, and ensure the best ideas are available to all members.

---

## **Functional Requirements**

### **User Roles**

### **Members**

- Register and log in to the portal
- Create, edit, and delete their own ideas
- Categorize ideas based on predefined categories (e.g., Energy, Waste, Transportation)
- Vote (up-vote/down-vote) or remove vote (Reddit-like system)

### **Paid Ideas**

- Members can mark ideas as "Paid"
- Other users must pay to view paid ideas
- Unauthenticated users must log in/register before purchasing
- Free ideas are visible to everyone

---

### **Admin**

- Approve or reject ideas (with feedback for rejection)
- Assign statuses:
    - Under Review
    - Approved
    - Rejected

---

## **Features**

### **Authentication**

- Email/password signup & login
- Password hashing
- JWT-based authentication
- Form validation and loading states

---

### **Idea Management (Only Logged-in Members)**

- Create ideas with:
    - Title
    - Problem statement
    - Proposed solution
    - Description
    - Images
- Submit ideas for review
- Default status: **Under Review**

### **Admin Actions**

- Approve → becomes public
- Reject → returns with feedback
- Members can edit/delete ideas **only if unpublished**

---

### **Admin Panel**

- View all ideas:
    - Approved
    - Rejected
- Reject ideas with feedback

---

### **Category System**

- Admin-defined categories
- Members must select a category when submitting

---

### **Voting System**

- Upvote / Downvote (one vote per user)
- Remove vote

---

### **Search and Filter**

- Search by keyword
- Filter by:
    - Name
    - Category

---

### **Responsive Design**

- Fully responsive (mobile, tablet, desktop)

---

## **Pages**

### **Navigation Bar**

- Home
- Ideas
- Dashboard
- About Us
- Blog
- Login/Register
- My Profile

---

## **Home Page**

### **Hero Banner**

- Cover image + tagline

### **Search**

- Search by:
    - Name
    - Category

### **Featured Ideas**

- Image
- Category
- Description
- “View Idea” button

### **Testimonials**

- Top 3 ideas based on votes

### **Newsletter**

- Email subscription

---

## **Footer**

- Contact info
- Copyright
- Terms & Privacy links

---

## **All Ideas Page**

### Features:

- Grid/Card layout showing:
    - Title
    - Category
    - Description
    - Image
    - Vote count
    - View button
    - Paid badge

### Pagination:

- 10–12 ideas per page

### Sorting:

- Recent
- Top voted
- Most commented

### Filtering:

- Category
- Payment status
- Vote range
- Author

### Search:

- Title / keyword

---

## **Idea Details Page**

### Content:

- Title
- Category
- Author
- Date
- Paid/Free label

### Main Section:

- Problem
- Solution
- Description
- Images

### Interaction:

- Voting system

---

## **Dashboard**

### **Admin Dashboard**

- Manage users
- Activate/deactivate users
- Manage ideas
- View idea status:
    - Under Review
    - Approved
    - Rejected

---

### **Member Dashboard**

- Create ideas
- Submit for review
- Track status

---

## **Error Handling**

### Validation

- Required fields
- Email format
- Payment validation

### Loading States

- API loading
- Payment loading

### Error Messages

- Invalid login
- Payment failure
- Unauthorized access

---

## **UI/UX Quality**

- Responsive design
- Clean layout
- Tailwind CSS
- Reusable components

---

## **Commit Requirements**

- Minimum 20 commits (client)
- Minimum 20 commits (server)

---

## **Video Explanation**

**Length:** 5–10 minutes

### Must include:

1. Registration
2. Login
3. Create Idea
4. Submit Idea
5. View Free Idea
6. Paid Idea Purchase
7. Voting System
8. Dashboard
9. Admin Moderation

---

## **Non-Functional Requirements**

- Clean UI/UX
- Modular code
- RESTful API design

---

## **Technology Stack**

### Frontend

- Next.js
- Tailwind CSS

### Backend

- Node.js + Express.js
- Prisma

### Database

- PostgreSQL

### Auth

- JWT

### Payment

- SSLCommerz / ShurjoPay / Stripe
---

## **Query Optimization & Professional Listing**

Implemented a global **`QueryBuilder`** utility to handle:
- **Pagination**: Consistent 10 items per page with meta information (`total`, `page`, `limit`, `totalPages`).
- **Searching**: Multi-field search (e.g., Title, Description, Name) with case-insensitive partial matching.
- **Filtering**: Dynamic filtering by fields like `categoryId`, `isPaid`, `role`, `status`.
- **Sorting**: Flexible sorting (e.g., `createdAt:desc`, `price:asc`).
- **Field Selection**: Optimize payload size by requesting specific fields.

Applied to:
- `Ideas` listing
- `Users` management
- `Categories` list
