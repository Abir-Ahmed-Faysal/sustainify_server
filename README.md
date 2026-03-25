# Sustainify Server 🌍

Sustainify is a comprehensive backend API built with **Node.js, Express, TypeScript, and Prisma**, designed to support a platform where users can share, vote on, and support sustainability ideas. 

The server features robust authentication, file uploads (images and PDFs) via Cloudinary, a Reddit-style voting system, automated newsletters, and Stripe payment integration.

---

## 🚀 Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Prisma](https://www.prisma.io/) (PostgreSQL)
- **Validation**: [Zod](https://zod.dev/)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **File Uploads**: [Multer](https://github.com/expressjs/multer) & [Cloudinary](https://cloudinary.com/)
- **Payments**: [Stripe](https://stripe.com/) API
- **Scheduling**: [node-cron](https://github.com/node-cron/node-cron)

---

## ✨ Features

- **🔐 Authentication & Authorization:** Secure JWT-based login, registration, and role-based access control (Admin, Member).
- **👤 User Profiles:** Manage profiles, bios, and avatar image uploads.
- **💡 Sustainability Ideas:** Create, read, update, and delete sustainability ideas. Includes support for uploading cover images and multiple attachments (PDFs/Images).
- **📂 Categories Management:** Organize ideas by categories with icon uploads.
- **🗳️ Voting System:** Reddit-style upvoting and downvoting with dynamic metrics (e.g., approval ratings).
- **💳 Premium Access:** Stripe Checkout integration for purchasing access to premium ideas.
- **📧 Automated Newsletter:** Cron jobs running weekly/periodically to distribute top-rated ideas to subscribed users via Nodemailer & EJS templates.
- **🛡️ Error Handling:** Global error handling, Zod validation interceptors, and Prisma error formatting.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: v18+ 
- **pnpm**: v9+ (or npm/yarn)
- **PostgreSQL**: A running instance of PostgreSQL database

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sustainify?schema=public"

# JWT Auth
JWT_ACCESS_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Cloudinary (File Uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Stripe (Payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
FRONTEND_URL="http://localhost:3000"

# Email Configuration (Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
```

---

## 🏃‍♂️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Abir-Ahmed-Faysal/sustainify_server.git
   cd sustainify_server
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Run Prisma Migrations:**
   ```bash
   pnpm migrate
   pnpm generate
   ```

4. **Start the Development Server:**
   ```bash
   pnpm dev
   ```
   *The server should now be running on `http://localhost:5000`.*

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Starts the development server using `tsx watch` |
| `pnpm build` | Compiles the TypeScript code into the `dist` folder |
| `pnpm start` | Runs the compiled JavaScript code from `dist` |
| `pnpm lint` | Runs ESLint across the codebase |
| `pnpm migrate` | Applies database migrations using Prisma |
| `pnpm generate` | Generates the Prisma Client |
| `pnpm studio` | Opens Prisma Studio to view and edit database records |
| `pnpm stripe:webhook` | Forwards Stripe webhook events to the local server |

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── config/          # Environment variables, Cloudinary & Multer config
│   ├── errorHelpers/    # Global error handling and formatting
│   ├── interfaces/      # Global TypeScript interfaces
│   ├── middleware/      # Express middlewares (Auth, Validation)
│   ├── modules/         # API Modules (Auth, Idea, Profile, Vote, Payment, etc.)
│   ├── routes/          # Central API routing
│   ├── shared/          # Reusable shared utilities
│   └── utilities/       # Helper functions (JWT, cleanup arrays, queries)
├── generated/           # Auto-generated Prisma client
├── server.ts            # Application bootstrap file
└── app.ts               # Express configuration, Cron jobs integration
```

---

## 🤝 Contribution Guidelines

1. Fork the repository
2. Create a new feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
