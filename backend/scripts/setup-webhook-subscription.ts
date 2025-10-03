import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setupWebhookSubscription() {
  try {
    console.log("🔧 Setting up webhook subscription for Instagram...");

    // Find the Instagram account
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

    // Create webhook subscription
    const webhookUrl = "https://neuraslide.onrender.com/webhooks/instagram";
    const events = ["comments", "mentions"];

    console.log("🔗 Creating webhook subscription...");
    console.log(`   Webhook URL: ${webhookUrl}`);
    console.log(`   Events: ${events.join(", ")}`);

    // Call the webhook subscription API
    const response = await fetch(
      "https://neuraslide.onrender.com/webhooks/instagram/subscription",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.JWT_SECRET}`, // You'll need to get a real JWT token
        },
        body: JSON.stringify({
          instagramAccountId: instagramAccount.id,
          events: events,
        }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Webhook subscription created successfully!");
      console.log("Subscription ID:", result.data.subscriptionId);
      console.log("Events:", result.data.events);
    } else {
      const error = await response.text();
      console.log("❌ Failed to create webhook subscription:");
      console.log(error);
    }
  } catch (error) {
    console.error("❌ Error setting up webhook subscription:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
setupWebhookSubscription();
