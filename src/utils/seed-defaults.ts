import { prisma } from "../lib/prisma.js";

const DEFAULT_CATEGORIES = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "Operations",
];

export async function ensureDefaultCategories() {
  try {
    for (const name of DEFAULT_CATEGORIES) {
      await prisma.jobCategory.upsert({
        where: { name },
        create: { name },
        update: {},
      });
    }
    console.log(`✓ Default categories ensured (${DEFAULT_CATEGORIES.length})`);
  } catch (error) {
    console.error("Failed to seed default categories:", error);
    // Don't crash app on seed failure — let server start regardless
  }
}
