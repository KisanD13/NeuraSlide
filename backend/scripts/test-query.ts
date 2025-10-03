import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testQuery() {
  try {
    const account = await prisma.instagramAccount.findFirst();
    console.log("Account teamId:", account?.teamId);

    if (account?.teamId) {
      const teamMember = await prisma.teamMember.findFirst({
        where: { teamId: account.teamId },
      });
      console.log("Query result:", teamMember);
    }

    // Try exact match
    const exactMatch = await prisma.teamMember.findFirst({
      where: { teamId: "68df8dc02ff03ba02119ef9f" },
    });
    console.log("Exact match:", exactMatch);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testQuery();
