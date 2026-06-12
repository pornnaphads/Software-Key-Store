import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Cleaning database...");
  await prisma.review.deleteMany({});
  await prisma.licenseKey.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Seeding users...");
  // Seed an admin and a test customer
  const admin = await prisma.user.create({
    data: {
      email: "admin@softkeystore.com",
      name: "Admin SoftKeyStore",
      password: "adminpassword123", // Simple plain-text for mock/local test
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "customer@example.com",
      name: "John Doe",
      password: "password123",
      role: "CUSTOMER",
    },
  });

  console.log("Seeding products...");
  const productsData = [
    {
      name: "Windows 11 Pro",
      description: "Windows 11 Professional Retail License Key. 1 PC Activation, lifetime validity, supports all languages and updates.",
      price: 790.00,
      originalPrice: 1590.00,
      category: "OS",
      image: "windows11_pro",
    },
    {
      name: "Windows 10 Pro",
      description: "Windows 10 Professional Retail License Key. Lifetime activation for 1 PC. Fully upgradeable to Windows 11.",
      price: 590.00,
      originalPrice: 1290.00,
      category: "OS",
      image: "windows10_pro",
    },
    {
      name: "Microsoft Office 2021 Professional Plus",
      description: "Microsoft Office 2021 Professional Plus Retail Key. Includes Word, Excel, PowerPoint, Outlook, OneNote, Access, and Publisher.",
      price: 1190.00,
      originalPrice: 2990.00,
      category: "Office",
      image: "office2021_pro",
    },
    {
      name: "Adobe Creative Cloud All Apps",
      description: "Adobe Creative Cloud All Apps 1 Year Subscription. Access to 20+ creative desktop and mobile apps including Photoshop, Illustrator, Premiere Pro.",
      price: 1790.00,
      originalPrice: 4500.00,
      category: "Design",
      image: "adobe_cc",
    },
    {
      name: "Adobe Photoshop 2024",
      description: "Adobe Photoshop 2024 Standalone 1 Year License. Professional image editing and design tool.",
      price: 890.00,
      originalPrice: 2200.00,
      category: "Design",
      image: "adobe_photoshop",
    },
    {
      name: "Adobe Premiere Pro 2024",
      description: "Adobe Premiere Pro 2024 Standalone 1 Year License. Industry-leading video editing software.",
      price: 890.00,
      originalPrice: 2200.00,
      category: "Design",
      image: "adobe_premiere",
    },
    {
      name: "Kaspersky Total Security",
      description: "Kaspersky Total Security 1 Year / 1 Device License. Award-winning antivirus protection for your files, identity, and online payments.",
      price: 690.00,
      originalPrice: 1290.00,
      category: "Security",
      image: "kaspersky_total",
    },
    {
      name: "ESET Smart Security Premium",
      description: "ESET Smart Security Premium 1 Year / 1 Device License. Ultimate internet security with firewall, secure browser, and password manager.",
      price: 690.00,
      originalPrice: 1290.00,
      category: "Security",
      image: "eset_smart",
    },
    {
      name: "CCleaner Professional Plus",
      description: "CCleaner Professional Plus 1 Year / 3 PCs License. System cleaning, speedup, software updater, and privacy protection.",
      price: 390.00,
      originalPrice: 790.00,
      category: "Security",
      image: "ccleaner_pro",
    },
    {
      name: "NordVPN Premium 1 Year",
      description: "NordVPN Premium 1 Year Subscription for up to 6 devices. High-speed, secure, and anonymous browsing with threat protection.",
      price: 890.00,
      originalPrice: 1890.00,
      category: "VPN",
      image: "nordvpn_1yr",
    },
  ];

  for (const productInfo of productsData) {
    const product = await prisma.product.create({
      data: {
        ...productInfo,
        stock: 5, // Initially 5 keys available
      },
    });

    console.log(`Seeding license keys for ${product.name}...`);
    // Seed 5 mock license keys for each product
    for (let i = 1; i <= 5; i++) {
      const keyFormatted = `${product.name.replace(/\s+/g, "").substring(0, 5).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      
      await prisma.licenseKey.create({
        data: {
          key: keyFormatted,
          productId: product.id,
          isUsed: false,
        },
      });
    }
  }

  console.log("Seeding sample orders and reviews...");
  // Create a sample completed order for the test customer
  const win11 = await prisma.product.findFirst({ where: { name: "Windows 11 Pro" } });
  const office2021 = await prisma.product.findFirst({ where: { name: "Microsoft Office 2021 Professional Plus" } });

  if (win11 && office2021) {
    // Get available keys to assign
    const win11Key = await prisma.licenseKey.findFirst({ where: { productId: win11.id, isUsed: false } });
    const officeKey = await prisma.licenseKey.findFirst({ where: { productId: office2021.id, isUsed: false } });

    if (win11Key && officeKey) {
      const order = await prisma.order.create({
        data: {
          userId: customer.id,
          total: win11.price + office2021.price,
          status: "COMPLETED",
          paymentMethod: "PROMPTPAY",
          orderItems: {
            create: [
              {
                productId: win11.id,
                quantity: 1,
                price: win11.price,
              },
              {
                productId: office2021.id,
                quantity: 1,
                price: office2021.price,
              },
            ],
          },
        },
        include: {
          orderItems: true,
        },
      });

      // Mark the keys as used and link them to the order items
      await prisma.licenseKey.update({
        where: { id: win11Key.id },
        data: { isUsed: true, orderItemId: order.orderItems[0].id },
      });

      await prisma.licenseKey.update({
        where: { id: officeKey.id },
        data: { isUsed: true, orderItemId: order.orderItems[1].id },
      });

      // Update product stock
      await prisma.product.update({
        where: { id: win11.id },
        data: { stock: { decrement: 1 } },
      });

      await prisma.product.update({
        where: { id: office2021.id },
        data: { stock: { decrement: 1 } },
      });

      // Create a sample review
      await prisma.review.create({
        data: {
          userId: customer.id,
          productId: win11.id,
          rating: 5,
          comment: "จัดส่งรวดเร็วทันใจ คีย์แท้ใช้งานได้ปกติ 100% แนะนำร้านนี้เลยครับ!",
        },
      });

      await prisma.review.create({
        data: {
          userId: customer.id,
          productId: office2021.id,
          rating: 4,
          comment: "ติดตั้งง่าย ใช้งานได้ดีมากครับ บริการหลังการขายดีมาก",
        },
      });
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
