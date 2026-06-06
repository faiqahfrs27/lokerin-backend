import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Provider, Role } from "../generated/prisma/client.js";
import { hash } from "argon2";

const adapter = new PrismaPg(
  { connectionString: process.env.DATABASE_URL! },
  { schema: "lokerin-backend" },
);

const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await hash(process.env.DEV_PASSWORD ?? "Dev@12345");

  await prisma.user.upsert({
    where: { email: "dev@lokerin.id" },
    update: {},
    create: {
      email: "dev@lokerin.id",
      passwordHash: hashedPassword,
      role: Role.dev,
      isVerified: true,
      provider: Provider.CREDENTIALS,
    },
  });

  console.log("Dev account seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
