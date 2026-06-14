import { prisma } from "../src/lib/prisma";

async function main() {
  const products = await prisma.product.findMany({
    include: { category: true }
  });
  console.log(JSON.stringify(products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price.toString(),
    stock: p.stock,
    description: p.description,
    category: p.category.name
  })), null, 2));
}

main();
