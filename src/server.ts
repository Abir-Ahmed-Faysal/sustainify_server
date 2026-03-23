import { Server } from "http";
import app from "./app";
// import { prisma } from "./app/lib/prisma";

let server: Server;
const PORT = process.env.PORT || 5000;

const bootstrap = async () => {
  try {
    // await prisma.$connect();
    // console.log("✅ Database connected successfully");

    server = app.listen(PORT, () => {
      console.log(`🚀 Sustainify Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Bootstrap Error:", error);
    process.exit(1); 
  }
};

const shutdown = async (signal: string, exitCode = 0) => {
  console.log(`⚠️ ${signal} received. Shutting down...`);
  try {
    if (server) {
      server.close(async () => {
        console.log("🛑 HTTP server closed");
        // await prisma.$disconnect();
        // console.log("🔌 Prisma disconnected");
        process.exit(exitCode);
      });
    } else {
      // await prisma.$disconnect();
      process.exit(exitCode);
    }
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT", 0));
process.on("SIGTERM", () => shutdown("SIGTERM", 0));

process.on("unhandledRejection", (reason) => {
  console.error("⚠️ Unhandled Rejection:", reason);
  shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  shutdown("uncaughtException", 1);
});

bootstrap();