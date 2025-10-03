import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debugTeamIds() {
  try {
    console.log("=== DEBUGGING TEAM IDs ===");

    const account = await prisma.instagramAccount.findFirst();
    console.log("Instagram Account teamId:", account?.teamId);

    if (account?.teamId) {
      const teamMember = await prisma.teamMember.findFirst({
        where: { teamId: account.teamId },
      });
      console.log("Team Member found:", !!teamMember);
      console.log("Team Member teamId:", teamMember?.teamId);
    }

    const allTeamMembers = await prisma.teamMember.findMany();
    console.log("All Team Members:");
    allTeamMembers.forEach((tm) => {
      console.log("  - userId:", tm.userId, "teamId:", tm.teamId);
    });

    const allTeams = await prisma.team.findMany();
    console.log("All Teams:");
    allTeams.forEach((t) => {
      console.log("  - id:", t.id, "name:", t.name);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTeamIds();
