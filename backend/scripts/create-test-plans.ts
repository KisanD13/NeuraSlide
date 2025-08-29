import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestPlans() {
  try {
    // Create test subscription plans
    const plans = [
      {
        name: "Free",
        description: "Perfect for trying out NeuraSlide",
        price: 0,
        interval: "MONTH",
        intervalCount: 1,
        features: {
          aiReplies: 50,
          instagramIntegration: true,
          basicTemplates: true,
          emailSupport: true,
          advancedAutomations: false,
          advancedAnalytics: false,
          prioritySupport: false,
          productCatalog: false,
          realTimeMonitoring: false,
        },
        isActive: true,
        stripePriceId: null, // Free plan doesn't need Stripe price
      },
      {
        name: "Pro Monthly",
        description: "Perfect for growing businesses",
        price: 60, // $60.00
        interval: "MONTH",
        intervalCount: 1,
        features: {
          aiReplies: -1, // Unlimited
          instagramIntegration: true,
          basicTemplates: true,
          emailSupport: true,
          advancedAutomations: true,
          advancedAnalytics: true,
          prioritySupport: true,
          productCatalog: true,
          realTimeMonitoring: true,
        },
        isActive: true,
        stripePriceId: "price_1S1TTuRreCqcRKInwWLKjitb", // TODO: Replace with your actual Stripe price ID from Stripe Dashboard
      },
      {
        name: "Pro Annual",
        description: "Save $120 with annual billing",
        price: 600, // $600.00
        interval: "YEAR",
        intervalCount: 1,
        features: {
          aiReplies: -1, // Unlimited
          instagramIntegration: true,
          basicTemplates: true,
          emailSupport: true,
          advancedAutomations: true,
          advancedAnalytics: true,
          prioritySupport: true,
          productCatalog: true,
          realTimeMonitoring: true,
        },
        isActive: true,
        stripePriceId: "price_1S1TUQRreCqcRKInqBTS3WxJ", // TODO: Replace with your actual Stripe price ID from Stripe Dashboard
      },
    ];

    // Clear existing plans and create new ones
    await prisma.subscriptionPlan.deleteMany({});
    console.log("🗑️ Cleared existing plans");

    for (const plan of plans) {
      console.log(`Creating plan: ${plan.name}...`);
      const createdPlan = await prisma.subscriptionPlan.create({
        data: {
          ...plan,
          interval: plan.interval as any, // Cast to 'any' to satisfy BillingInterval enum
        },
      });
      console.log(`✅ Created plan: ${plan.name} with ID: ${createdPlan.id}`);
    }

    console.log("✅ Test plans created/updated successfully!");
  } catch (error) {
    console.error("❌ Error creating test plans:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestPlans();
