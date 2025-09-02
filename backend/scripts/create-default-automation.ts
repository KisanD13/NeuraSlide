// backend/scripts/create-default-automation.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createDefaultCommentAutomation() {
  try {
    console.log("Creating default Instagram comment automation...");

    // Find the first user with an Instagram account
    const instagramAccount = await prisma.instagramAccount.findFirst();

    if (!instagramAccount) {
      console.log(
        "No Instagram accounts found. Please connect an Instagram account first."
      );
      return;
    }

    console.log(`Found Instagram account: ${instagramAccount.igUsername}`);

    // Find a team member for this team
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId: instagramAccount.teamId,
      },
    });

    if (!teamMember) {
      console.log("No team members found for Instagram account.");
      return;
    }

    const userId = teamMember.userId;

    console.log(`Creating automation for user: ${userId}`);

    // Create default comment automation
    const automation = await prisma.automation.create({
      data: {
        userId,
        name: "Auto-Reply to Instagram Comments",
        description: "Automatically replies to Instagram comments using AI",
        trigger: {
          type: "comment_received",
          conditions: {
            platform: "instagram",
            replyWithin: "5_minutes",
          },
        },
        response: {
          type: "ai_generated",
          prompt:
            "Generate a friendly, helpful response to this Instagram comment. Keep it under 200 characters and make it engaging.",
          maxLength: 200,
          temperature: 0.7,
          includeContext: true,
        },
        priority: "MEDIUM",
        tags: ["instagram", "auto-reply", "ai"],
        conditions: [],
        status: "ACTIVE",
        isActive: true,
        performance: {
          totalTriggers: 0,
          successfulResponses: 0,
          failedResponses: 0,
          averageResponseTime: 0,
          successRate: 0,
        },
      },
    });

    console.log("✅ Default comment automation created successfully!");
    console.log("Automation ID:", automation.id);
    console.log("Name:", automation.name);
    console.log("Status:", automation.status);
  } catch (error) {
    console.error("❌ Error creating default automation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createDefaultCommentAutomation();
