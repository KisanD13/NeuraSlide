import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createDefaultCommentAutomation() {
  try {
    console.log("🔍 Looking for Instagram accounts with connected users...");

    // Find the first Instagram account
    const instagramAccount = await prisma.instagramAccount.findFirst({
      where: { isActive: true },
    });

    if (!instagramAccount) {
      console.log("❌ No active Instagram accounts found");
      return;
    }

    console.log(`📱 Found Instagram account: ${instagramAccount.igUsername}`);

    // Find team member for this Instagram account
    const teamMember = await prisma.teamMember.findFirst({
      where: { teamId: instagramAccount.teamId },
    });

    if (!teamMember) {
      console.log("❌ No team member found for Instagram account");
      return;
    }

    const userId = teamMember.userId;
    console.log(`👤 Found user: ${userId}`);

    // Check if automation already exists
    const existingAutomation = await prisma.automation.findFirst({
      where: {
        userId,
        name: "Auto-Reply to Instagram Comments",
      },
    });

    if (existingAutomation) {
      console.log("✅ Default automation already exists");
      console.log("Automation ID:", existingAutomation.id);
      console.log("Status:", existingAutomation.status);
      console.log("Is Active:", existingAutomation.isActive);
      return;
    }

    console.log(`🤖 Creating automation for user: ${userId}`);

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
    console.log("Is Active:", automation.isActive);
  } catch (error) {
    console.error("❌ Error creating default automation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createDefaultCommentAutomation();
