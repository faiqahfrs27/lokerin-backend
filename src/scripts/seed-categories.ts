import "dotenv/config";
import { prisma } from "../lib/prisma.js";

const CATEGORIES = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "Operations",
];

async function main() {
  console.log("Seeding job categories...");

  for (const name of CATEGORIES) {
    const result = await prisma.jobCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`  ✓ ${result.name} (${result.id})`);
  }

  const total = await prisma.jobCategory.count();
  console.log(`\nDone. Total categories in DB: ${total}`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
