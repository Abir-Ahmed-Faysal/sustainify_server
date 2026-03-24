import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { envVars } from "../config/env";
import { Role } from "../../generated/prisma";

export const seedAdmin = async () => {
  try {
    const adminEmail = envVars.ADMIN_EMAIL;
    const adminPassword = envVars.ADMIN_PASSWORD;
    

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("Admin user already exists. Skipping seed.");
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        isActive: true,
      },
    });

    console.log("✅ Admin user seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
  }
};
