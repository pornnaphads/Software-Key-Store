import { prisma } from "../src/lib/prisma";

async function main() {
  try {
    const product = await prisma.product.findFirst();
    if (!product) {
      console.log("No product found");
      return;
    }
    console.log("Original Product:", product.id, product.name, product.price.toString());
    
    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        price: "1234.56"
      }
    });
    console.log("Updated Product price:", updated.price.toString());
  } catch (error) {
    console.error("Error updating product:", error);
  }
}

main();
