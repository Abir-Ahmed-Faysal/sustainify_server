import { Server } from "http";
import app from "./app";
import { envVars } from "./app/config/env";
import { prisma } from "./app/lib/prisma";


let server: Server;
const PORT = envVars.PORT  || 5000;

const bootstrap = async () => {
  try {
     await prisma.$connect();
     console.log("✅ Database connected successfully");

    server = app.listen(PORT, () => {
      console.log(`🚀 Sustainify Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Bootstrap Error:", error);
    process.exit(1); 
  }
};

process.on("unhandledRejection", (reason) => {
  console.error("⚠️ Unhandled Rejection:", reason);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  process.exit(1);
});

process.on("SIGINT", async () => {
  console.log("⚠️ SIGINT received");
  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
});

process.on("SIGTERM", async () => {
  console.log("⚠️ SIGTERM received");
  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
});

bootstrap();