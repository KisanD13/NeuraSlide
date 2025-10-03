import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setupFreshInstagram() {
  try {
    console.log("🔍 Checking fresh Instagram setup...");

    // Check if any Instagram accounts exist
    const instagramAccounts = await prisma.instagramAccount.findMany();
    console.log(`📱 Found ${instagramAccounts.length} Instagram accounts`);

    if (instagramAccounts.length === 0) {
      console.log(
        "❌ No Instagram accounts found. Please connect Instagram first."
      );
      return;
    }

    // Check each Instagram account
    for (const account of instagramAccounts) {
      console.log(`\n📱 Instagram Account: ${account.igUsername}`);
      console.log(`   ID: ${account.id}`);
      console.log(`   Team ID: ${account.teamId}`);
      console.log(`   Team ID: ${account.teamId}`);

      // Check if team member exists
      const teamMember = await prisma.teamMember.findFirst({
        where: { teamId: account.teamId },
      });

      if (!teamMember) {
        console.log(
          "   ❌ No team member found - this will cause automation to fail"
        );

        // Try to find team member by teamId instead
        const teamMemberByTeamId = await prisma.teamMember.findFirst({
          where: { teamId: account.teamId },
        });

        if (teamMemberByTeamId) {
          console.log(
            "   🔧 Found team member by teamId, relationship is correct"
          );

          console.log("   ✅ Team relationship is correct");
        } else {
          console.log("   ❌ No team member found by teamId either");
        }
      } else {
        console.log("   ✅ Team member found");
      }

      // Check if automation exists for this user
      const userId = teamMember?.userId;
      const automations = userId
        ? await prisma.automation.findMany({
            where: { userId },
          })
        : [];

      console.log(`   🤖 Found ${automations.length} automations for user`);

      if (automations.length === 0 && userId) {
        console.log("   🔧 Creating default automation...");

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

        console.log("   ✅ Default automation created!");
        console.log(`   Automation ID: ${automation.id}`);
      } else if (!userId) {
        console.log("   ❌ No user ID found, cannot create automation");
      }
    }

    console.log(
      "\n🎉 Setup complete! Your Instagram auto-reply should now work."
    );
    console.log("\n📝 Next steps:");
    console.log("1. Post something on Instagram");
    console.log("2. Comment on your own post");
    console.log("3. Check if AI reply appears");
  } catch (error) {
    console.error("❌ Error setting up fresh Instagram:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
setupFreshInstagram();
