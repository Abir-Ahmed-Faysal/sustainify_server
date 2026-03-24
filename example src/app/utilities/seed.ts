import { Role } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import auth from "../lib/auth";
import { prisma } from "../lib/prisma"

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdmin = await prisma.user.findFirst({
      where: {
        email: envVars.USER.SUPER_ADMIN_EMAIL
      }
    })

    if (isSuperAdmin) {
      console.log("Super admin already exists. Skipping seed.")
      return
    }

    const superAdminUser = await auth.api.signUpEmail({
      body: {
        name: "super_admin",
        email: envVars.USER.SUPER_ADMIN_EMAIL,
        password: envVars.USER.SUPER_ADMIN_PASSWORD,
        role: Role.SUPER_ADMIN,
        needPasswordChange: false,
        rememberMe: false
      }
    })

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: superAdminUser.user.id },
        data: { emailVerified: true }
      })

      const superAdmin = await tx.super_Admin.create({
        data: {
          userId: superAdminUser.user.id,
          name: "super admin",
          email: superAdminUser.user.email
        },
        include: {
          user: true
        }
      })

      console.log("Super admin created successfully", superAdmin)
    })

  } catch (error) {
    console.error("Error occurred when seeding", error)

    await prisma.user.deleteMany({
      where: {
        email: envVars.USER.SUPER_ADMIN_EMAIL
      }
    })
  }
}