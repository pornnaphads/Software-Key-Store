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

async function main() {
  const count = await prisma.discount.count();
  console.log("Discount count:", count);
  const discounts = await prisma.discount.findMany();
  console.log("Discounts:", discounts);
}

main().catch(console.error);
