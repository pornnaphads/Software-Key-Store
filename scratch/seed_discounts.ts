const fs = require("fs");
const path = require("path");

// Read .env file
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim().replace(/^['"]|['"]$/g, "");
      process.env[key] = val;
    }
  }
}

const { prisma } = require("../src/lib/prisma");

const discountCodes = [
  {
    amount: 50,
    code: "NEWUSER50",
    startDate: new Date("2026-01-01T00:00:00Z"),
    expiry: new Date("2027-12-31T23:59:59Z"),
  },
  {
    amount: 30,
    code: "MEMBER3JUN",
    startDate: new Date("2026-06-01T00:00:00Z"),
    expiry: new Date("2027-06-30T23:59:59Z"),
  },
  {
    amount: 20,
    code: "OFFICE20",
    startDate: new Date("2026-01-01T00:00:00Z"),
    expiry: new Date("2027-07-15T23:59:59Z"),
  },
  {
    amount: 100,
    code: "SUMMER100",
    startDate: new Date("2026-03-01T00:00:00Z"),
    expiry: new Date("2027-08-31T23:59:59Z"),
  },
  {
    amount: 40,
    code: "ADOBE40OFF",
    startDate: new Date("2026-01-01T00:00:00Z"),
    expiry: new Date("2028-02-28T23:59:59Z"),
  },
  {
    amount: 25,
    code: "WINPRO25",
    startDate: new Date("2026-01-01T00:00:00Z"),
    expiry: new Date("2027-09-30T23:59:59Z"),
  },
];

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    console.error("Admin user not found. Run seed script first.");
    return;
  }

  console.log(`Using Admin User: ${admin.email} (ID: ${admin.id})`);

  for (const disc of discountCodes) {
    // Check if discount with same customerType already exists
    const existing = await prisma.discount.findFirst({
      where: { customerType: disc.code },
    });

    if (existing) {
      console.log(`Discount code ${disc.code} already exists. Skipping.`);
      continue;
    }

    await prisma.discount.create({
      data: {
        discountAmount: disc.amount,
        customerType: disc.code,
        startDate: disc.startDate,
        expirationDate: disc.expiry,
        status: "ACTIVE",
        userId: admin.id,
      },
    });
    console.log(`Created discount code: ${disc.code}`);
  }

  const count = await prisma.discount.count();
  console.log("Total discounts in DB:", count);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
