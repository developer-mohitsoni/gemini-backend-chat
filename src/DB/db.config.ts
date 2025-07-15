import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources:{
    db: {
      url: process.env.DATABASE_URL!,
  }}
});

async function main() {
  await prisma.$connect();
  console.log("Connected to the database");
}
main().catch((e) => {
  console.error("Database connection error:", e);
  process.exit(1);
});

export default prisma;