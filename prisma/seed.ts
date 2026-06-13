import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";

import { prisma } from "../src/lib/prisma";

const money = (value: string) => new Prisma.Decimal(value);

interface OrderSeed {
  userId: number;
  productIndex: number;
  subtotal: string;
  discountAmount: string;
  total: string;
  discountCode?: string;
  status: "PENDING" | "PAID" | "COMPLETED" | "CANCELLED";
  paymentMethod: "PROMPTPAY" | "TRUEMONEY" | "CREDIT_CARD";
}

async function main() {
  console.log("Cleaning database...");
  await prisma.discountUsage.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.review.deleteMany();
  await prisma.licenseKey.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const [adminPassword, customerPassword] = await Promise.all([
    hash("adminpassword123", 12),
    hash("password123", 12),
  ]);

  console.log("Seeding users...");
  await prisma.user.create({
    data: {
      email: "admin@softkeystore.com",
      name: "Admin SoftKeyStore",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const customers = await Promise.all(
    [
      ["customer@example.com", "Mint Jirawat"],
      ["n.jongjai@email.com", "Nutthapong Jongjai"],
      ["parichat.k@gmail.com", "Parichat Kerdkaew"],
      ["wichaya.s@outlook.com", "Wichaya Saelee"],
      ["thanakorn.p@me.com", "Thanakorn P."],
    ].map(([email, name]) =>
      prisma.user.create({
        data: {
          email,
          name,
          password: customerPassword,
          role: "CUSTOMER",
        },
      }),
    ),
  );

  console.log("Seeding products...");
  const productsData = [
    {
      name: "Windows 11 Pro",
      description:
        "Windows 11 Professional Retail License Key สำหรับ 1 เครื่อง ใช้งานถาวร รองรับทุกภาษาและการอัปเดต",
      price: "790.00",
      originalPrice: "1590.00",
      category: "OS",
      image: "windows11_pro",
    },
    {
      name: "Windows 10 Pro",
      description:
        "Windows 10 Professional Retail License Key สำหรับ 1 เครื่อง พร้อมอัปเกรดเป็น Windows 11",
      price: "590.00",
      originalPrice: "1290.00",
      category: "OS",
      image: "windows10_pro",
    },
    {
      name: "Microsoft Office 2021 Professional Plus",
      description:
        "Microsoft Office 2021 Professional Plus ประกอบด้วย Word, Excel, PowerPoint, Outlook, OneNote, Access และ Publisher",
      price: "1190.00",
      originalPrice: "2990.00",
      category: "Office",
      image: "office2021_pro",
    },
    {
      name: "Adobe Creative Cloud All Apps",
      description:
        "Adobe Creative Cloud All Apps ระยะเวลา 1 ปี พร้อมแอปสร้างสรรค์มากกว่า 20 รายการ",
      price: "1790.00",
      originalPrice: "4500.00",
      category: "Design",
      image: "adobe_cc",
    },
    {
      name: "Adobe Photoshop 2024",
      description:
        "Adobe Photoshop 2024 ระยะเวลา 1 ปี สำหรับงานแต่งภาพและออกแบบระดับมืออาชีพ",
      price: "890.00",
      originalPrice: "2200.00",
      category: "Design",
      image: "adobe_photoshop",
    },
    {
      name: "Adobe Premiere Pro 2024",
      description:
        "Adobe Premiere Pro 2024 ระยะเวลา 1 ปี สำหรับงานตัดต่อวิดีโอระดับมืออาชีพ",
      price: "890.00",
      originalPrice: "2200.00",
      category: "Design",
      image: "adobe_premiere",
    },
    {
      name: "Kaspersky Total Security",
      description:
        "Kaspersky Total Security ระยะเวลา 1 ปี สำหรับ 1 อุปกรณ์ ปกป้องไฟล์ ตัวตน และธุรกรรมออนไลน์",
      price: "690.00",
      originalPrice: "1290.00",
      category: "Security",
      image: "kaspersky_total",
    },
    {
      name: "ESET Smart Security Premium",
      description:
        "ESET Smart Security Premium ระยะเวลา 1 ปี สำหรับ 1 อุปกรณ์ พร้อมไฟร์วอลล์และตัวจัดการรหัสผ่าน",
      price: "690.00",
      originalPrice: "1290.00",
      category: "Security",
      image: "eset_smart",
    },
    {
      name: "CCleaner Professional Plus",
      description:
        "CCleaner Professional Plus ระยะเวลา 1 ปี สำหรับ 3 เครื่อง ช่วยทำความสะอาดและเพิ่มความเร็วระบบ",
      price: "390.00",
      originalPrice: "790.00",
      category: "Security",
      image: "ccleaner_pro",
    },
    {
      name: "NordVPN Premium 1 Year",
      description:
        "NordVPN Premium ระยะเวลา 1 ปี สำหรับสูงสุด 6 อุปกรณ์ ท่องเว็บได้รวดเร็วและเป็นส่วนตัว",
      price: "890.00",
      originalPrice: "1890.00",
      category: "VPN",
      image: "nordvpn_1yr",
    },
  ];

  const products = [];
  for (const [productIndex, productInfo] of productsData.entries()) {
    const product = await prisma.product.create({
      data: {
        ...productInfo,
        price: money(productInfo.price),
        originalPrice: money(productInfo.originalPrice),
        stock: 5,
      },
    });
    products.push(product);

    await prisma.licenseKey.createMany({
      data: Array.from({ length: 5 }, (_, keyIndex) => ({
        key: `SKS-${String(productIndex + 1).padStart(2, "0")}-${String(
          keyIndex + 1,
        ).padStart(2, "0")}-DEMO-2026`,
        productId: product.id,
      })),
    });
  }

  console.log("Seeding discounts and orders...");
  const welcomeDiscount = await prisma.discount.create({
    data: {
      code: "WELCOME10",
      type: "PERCENT",
      value: money("10.00"),
      minimumOrderAmount: money("500.00"),
      maximumDiscountAmount: money("300.00"),
      startsAt: new Date("2026-01-01T00:00:00+07:00"),
      endsAt: new Date("2026-12-31T23:59:59+07:00"),
      usageLimit: 1000,
      perUserLimit: 1,
      isActive: true,
    },
  });

  const orderSeeds: OrderSeed[] = [
    {
      userId: customers[0].id,
      productIndex: 1,
      subtotal: "590.00",
      discountAmount: "0.00",
      total: "590.00",
      status: "PENDING",
      paymentMethod: "PROMPTPAY",
    },
    {
      userId: customers[1].id,
      productIndex: 0,
      subtotal: "790.00",
      discountAmount: "0.00",
      total: "790.00",
      status: "PAID",
      paymentMethod: "CREDIT_CARD",
    },
    {
      userId: customers[2].id,
      productIndex: 2,
      subtotal: "1190.00",
      discountAmount: "119.00",
      total: "1071.00",
      discountCode: "WELCOME10",
      status: "COMPLETED",
      paymentMethod: "PROMPTPAY",
    },
    {
      userId: customers[3].id,
      productIndex: 6,
      subtotal: "690.00",
      discountAmount: "0.00",
      total: "690.00",
      status: "CANCELLED",
      paymentMethod: "TRUEMONEY",
    },
  ];

  const seededOrders = [];
  for (const orderSeed of orderSeeds) {
    const product = products[orderSeed.productIndex];
    const order = await prisma.order.create({
      data: {
        userId: orderSeed.userId,
        subtotal: money(orderSeed.subtotal),
        discountAmount: money(orderSeed.discountAmount),
        total: money(orderSeed.total),
        discountCode: orderSeed.discountCode ?? null,
        status: orderSeed.status,
        paymentMethod: orderSeed.paymentMethod,
        orderItems: {
          create: {
            productId: product.id,
            quantity: 1,
            price: product.price,
          },
        },
      },
      include: { orderItems: true },
    });
    seededOrders.push(order);
  }

  const completedOrder = seededOrders[2];
  await prisma.discountUsage.create({
    data: {
      discountId: welcomeDiscount.id,
      userId: customers[2].id,
      orderId: completedOrder.id,
      codeSnapshot: welcomeDiscount.code,
      subtotalSnapshot: completedOrder.subtotal,
      discountAmount: completedOrder.discountAmount,
      totalSnapshot: completedOrder.total,
    },
  });

  const completedProduct = products[2];
  const completedKey = await prisma.licenseKey.findFirstOrThrow({
    where: { productId: completedProduct.id, isUsed: false },
  });
  await prisma.licenseKey.update({
    where: { id: completedKey.id },
    data: {
      isUsed: true,
      orderItemId: completedOrder.orderItems[0].id,
    },
  });
  await prisma.product.update({
    where: { id: completedProduct.id },
    data: { stock: { decrement: 1 } },
  });

  await prisma.review.create({
    data: {
      userId: customers[2].id,
      productId: completedProduct.id,
      rating: 5,
      comment:
        "ได้รับคีย์รวดเร็ว ติดตั้งง่าย และใช้งานได้ตามปกติ บริการหลังการขายดีมาก",
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
