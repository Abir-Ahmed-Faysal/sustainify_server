import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { sendEmail } from "./email";
import { envVars } from "../config/env";

const sendNewsletterEmails = async () => {
  try {
    console.log("📬 Newsletter cron triggered —", new Date().toISOString());

    // 1. Get active subscribers
    const subscribers = await prisma.newsletter.findMany({
      where: { isActive: true },
      select: { email: true },
    });

    if (subscribers.length === 0) {
      console.log("📭 No active subscribers found. Skipping.");
      return;
    }

    // 2. Get top 5 approved ideas by positiveRatio
    const topIdeas = await prisma.idea.findMany({
      where: {
        status: "APPROVED",
        isDeleted: false,
      },
      orderBy: { positiveRatio: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        problemStatement: true,
        positiveRatio: true,
        totalUpVotes: true,
      },
    });

    if (topIdeas.length === 0) {
      console.log("📭 No approved ideas found. Skipping.");
      return;
    }

    const frontendUrl = envVars.FRONTEND_URL;

    // 3. Send email to each subscriber
    for (const subscriber of subscribers) {
      try {
        await sendEmail({
          to: subscriber.email,
          subject: "🌱 Sustainify — Top Trending Ideas Right Now!",
          templateName: "newsletter",
          templateData: {
            ideas: topIdeas,
            frontendUrl,
          },
        });
      } catch (error) {
        console.error(
          `❌ Failed to send newsletter to ${subscriber.email}:`,
          error
        );
      }
    }

    console.log(
      `✅ Newsletter sent to ${subscribers.length} subscriber(s) with ${topIdeas.length} idea(s).`
    );
  } catch (error) {
    console.error("❌ Newsletter cron error:", error);
  }
};

export const startNewsletterCron = () => {
  // Runs every 15 minutes
  cron.schedule("*/15 * * * *", () => {
    sendNewsletterEmails();
  });

  console.log("⏰ Newsletter cron scheduled — every 15 minutes");
};
