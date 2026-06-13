const { Prisma } = require("@prisma/client");
const { hash } = require("bcryptjs");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const { PrismaClient } = require("@prisma/client");
const { encryptKey } = require("../src/lib/encryption");

const databaseUrl = process.env.DATABASE_URL || "mysql://root:@localhost:3306/newsoftstore";
const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

const money = (value: string | number) => new Prisma.Decimal(value);

function generateRealisticProductKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segment = () => Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return segment() + "-" + segment() + "-" + segment() + "-" + segment() + "-" + segment();
}

async function main() {
  console.log("Cleaning database...");
  await prisma.receipt.deleteMany().catch(() => {});
  await prisma.payment.deleteMany().catch(() => {});
  await prisma.orderItem.deleteMany().catch(() => {});
  await prisma.order.deleteMany().catch(() => {});
  await prisma.review.deleteMany().catch(() => {});
  await prisma.discount.deleteMany().catch(() => {});
  await prisma.cart.deleteMany().catch(() => {});
  await prisma.request.deleteMany().catch(() => {});
  await prisma.productKey.deleteMany().catch(() => {});
  await prisma.product.deleteMany().catch(() => {});
  await prisma.category.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  const [adminPassword, customerPassword] = await Promise.all([
    hash("adminpassword123", 12),
    hash("password123", 12),
  ]);

  console.log("Seeding users...");
  const admin = await prisma.user.create({
    data: {
      email: "admin@softkeystore.com",
      firstName: "Admin",
      lastName: "SoftKeyStore",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const customers = await Promise.all([
    prisma.user.create({
      data: {
        email: "customer@example.com",
        firstName: "Mint",
        lastName: "Jirawat",
        password: customerPassword,
        role: "CUSTOMER",
      },
    }),
    prisma.user.create({
      data: {
        email: "n.jongjai@email.com",
        firstName: "Nutthapong",
        lastName: "Jongjai",
        password: customerPassword,
        role: "CUSTOMER",
      },
    }),
  ]);

  console.log("Seeding categories...");
  const categoriesData = [
    { name: "OS" },
    { name: "Office" },
    { name: "Design" },
    { name: "Security" },
    { name: "VPN" },
  ];

  const categories: Record<string, number> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.name] = created.id;
  }

  console.log("Seeding 60 products...");
  const productsData = [
    // Category: OS (CategoryId from categories["OS"])
    {
      name: "Test Payment (5 Baht)",
      description: "สินค้าทดสอบระบบชำระเงินราคา 5 บาท",
      price: "5.00",
      categoryName: "OS",
      image: "windows11_pro",
      key: "TEST-5BAHT-KEY-PROD",
    },
    {
      name: "Windows 11 Pro",
      description: "Windows 11 Professional Retail License Key สำหรับ 1 เครื่อง ใช้งานถาวร รองรับทุกภาษาและการอัปเดต",
      price: "790.00",
      categoryName: "OS",
      image: "windows11_pro",
      key: "W11P-ABCD-EFGH-IJKL-1111",
    },
    {
      name: "Windows 11 Home",
      description: "Windows 11 Home Retail License Key สำหรับใช้งานส่วนบุคคล อัปเกรดระบบความปลอดภัยล่าสุด",
      price: "690.00",
      categoryName: "OS",
      image: "windows11_home",
      key: "W11H-ABCD-EFGH-IJKL-2222",
    },
    {
      name: "Windows 10 Pro",
      description: "Windows 10 Professional Retail License Key สำหรับ 1 เครื่อง พร้อมรองรับการอัปเกรดเป็น Windows 11 ฟรี",
      price: "590.00",
      categoryName: "OS",
      image: "windows10_pro",
      key: "W10P-ABCD-EFGH-IJKL-3333",
    },
    {
      name: "Windows Server 2022 Standard",
      description: "Windows Server 2022 Standard License Key (16 Core) สำหรับระบบเซิร์ฟเวอร์ในองค์กร",
      price: "3490.00",
      categoryName: "OS",
      image: "windows_server_2022",
      key: "WS22-ABCD-EFGH-IJKL-4444",
    },
    {
      name: "Windows 10 Home",
      description: "Windows 10 Home Retail License Key ลิขสิทธิ์แท้สำหรับการใช้งานทั่วไปและครอบครัว",
      price: "490.00",
      categoryName: "OS",
      image: "windows10_home",
      key: "W10H-ABCD-EFGH-IJKL-0005",
    },
    {
      name: "Windows Server 2019 Standard",
      description: "Windows Server 2019 Standard License Key (16 Core) เพื่อการจัดการโครงสร้างพื้นฐานไอทีในองค์กร",
      price: "2990.00",
      categoryName: "OS",
      image: "windows_server_2019",
      key: "WS19-ABCD-EFGH-IJKL-0006",
    },
    {
      name: "Windows Server 2022 Datacenter",
      description: "Windows Server 2022 Datacenter License Key คีย์ลิขสิทธิ์ระดับสูงสุดสำหรับ Datacenter ขนาดใหญ่",
      price: "5990.00",
      categoryName: "OS",
      image: "windows_server_2022_datacenter",
      key: "WS22D-ABCD-EFGH-IJKL-0007",
    },
    {
      name: "Windows Server 2019 Datacenter",
      description: "Windows Server 2019 Datacenter License Key คีย์ลิขสิทธิ์เพื่อการทำ Virtualization ขั้นสูง",
      price: "4990.00",
      categoryName: "OS",
      image: "windows_server_2019_datacenter",
      key: "WS19D-ABCD-EFGH-IJKL-0008",
    },
    {
      name: "Windows 11 Enterprise",
      description: "Windows 11 Enterprise สำหรับองค์กรธุรกิจขนาดใหญ่ที่ต้องการระบบจัดการและความปลอดภัยระดับสูง",
      price: "1290.00",
      categoryName: "OS",
      image: "windows11_enterprise",
      key: "W11E-ABCD-EFGH-IJKL-0009",
    },
    {
      name: "Windows 10 Enterprise",
      description: "Windows 10 Enterprise ลิขสิทธิ์แท้สำหรับระบบองค์กรขนาดกลางและใหญ่ ปลอดภัยและมีประสิทธิภาพ",
      price: "1090.00",
      categoryName: "OS",
      image: "windows10_enterprise",
      key: "W10E-ABCD-EFGH-IJKL-0010",
    },
    {
      name: "Windows Server 2016 Standard",
      description: "Windows Server 2016 Standard License Key สำหรับระบบองค์กรที่ยังคงต้องการเสถียรภาพระดับตำนาน",
      price: "1990.00",
      categoryName: "OS",
      image: "windows_server_2016",
      key: "WS16-ABCD-EFGH-IJKL-0011",
    },
    {
      name: "Windows 8.1 Professional",
      description: "Windows 8.1 Professional Retail License Key สำหรับเครื่องคอมพิวเตอร์สเปกเก่าที่เสถียร",
      price: "290.00",
      categoryName: "OS",
      image: "windows8_pro",
      key: "W81P-ABCD-EFGH-IJKL-0012",
    },
    // Category: Office
    {
      name: "Microsoft Office 2021 Professional Plus",
      description: "Microsoft Office 2021 Professional Plus ประกอบด้วย Word, Excel, PowerPoint, Outlook, OneNote, Access และ Publisher ใช้งานถาวร",
      price: "1190.00",
      categoryName: "Office",
      image: "office2021_pro",
      key: "O21P-ABCD-EFGH-IJKL-5555",
    },
    {
      name: "Microsoft Office 2019 Professional Plus",
      description: "Microsoft Office 2019 Professional Plus ชุดโปรแกรมออฟฟิศยอดนิยมสำหรับทำงานเอกสารครบวงจร",
      price: "990.00",
      categoryName: "Office",
      image: "office2019_pro",
      key: "O19P-ABCD-EFGH-IJKL-6666",
    },
    {
      name: "Microsoft Office 365 Personal (1 Year)",
      description: "Office 365 Personal สำหรับ 1 ผู้ใช้ ระยะเวลา 1 ปี มาพร้อมพื้นที่เก็บข้อมูล OneDrive 1 TB",
      price: "1490.00",
      categoryName: "Office",
      image: "office365_personal",
      key: "O365P-ABCD-EFGH-IJKL-7777",
    },
    {
      name: "Microsoft Office 365 Family (1 Year)",
      description: "Office 365 Family สำหรับใช้งานสูงสุด 6 คน ระยะเวลา 1 ปี แชร์พื้นที่ OneDrive คนละ 1 TB",
      price: "2190.00",
      categoryName: "Office",
      image: "office365_family",
      key: "O365F-ABCD-EFGH-IJKL-8888",
    },
    {
      name: "Microsoft Office 2021 Home & Business for Mac",
      description: "Microsoft Office 2021 สำหรับผู้ใช้ Mac ใช้งานถาวรเพื่อธุรกิจขนาดเล็กและงานส่วนตัว",
      price: "1890.00",
      categoryName: "Office",
      image: "office2021_mac",
      key: "O21M-ABCD-EFGH-IJKL-0013",
    },
    {
      name: "Microsoft Office 2019 Home & Business for Mac",
      description: "Microsoft Office 2019 สำหรับผู้ใช้ Mac ประกอบด้วย Word, Excel, PowerPoint และ Outlook ใช้งานถาวร",
      price: "1490.00",
      categoryName: "Office",
      image: "office2019_mac",
      key: "O19M-ABCD-EFGH-IJKL-0014",
    },
    {
      name: "Microsoft Project Professional 2021",
      description: "Microsoft Project 2021 เครื่องมือการบริหารจัดการโครงการระดับมืออาชีพสำหรับผู้จัดการโครงการ",
      price: "1290.00",
      categoryName: "Office",
      image: "project2021_pro",
      key: "PROJ21-ABCD-EFGH-IJKL-0015",
    },
    {
      name: "Microsoft Visio Professional 2021",
      description: "Microsoft Visio 2021 สร้างแผนภูมิ ไดอะแกรม และโฟลว์ชาร์ตระดับมืออาชีพได้อย่างง่ายดาย",
      price: "1290.00",
      categoryName: "Office",
      image: "visio2021_pro",
      key: "VIS21-ABCD-EFGH-IJKL-0016",
    },
    {
      name: "Microsoft Project Professional 2019",
      description: "Microsoft Project 2019 ลิขสิทธิ์แท้สำหรับการวางแผน กำหนดตารางงาน และบริหารโครงการ",
      price: "990.00",
      categoryName: "Office",
      image: "project2019_pro",
      key: "PROJ19-ABCD-EFGH-IJKL-0017",
    },
    {
      name: "Microsoft Visio Professional 2019",
      description: "Microsoft Visio 2019 เครื่องมือวาดไดอะแกรมระดับสากล ใช้งานถาวร ปลอดภัย",
      price: "990.00",
      categoryName: "Office",
      image: "visio2019_pro",
      key: "VIS19-ABCD-EFGH-IJKL-0018",
    },
    {
      name: "Microsoft Office 2016 Professional Plus",
      description: "Microsoft Office 2016 รุ่นคลาสสิกสำหรับผู้ใช้ที่คุ้นเคยกับฟังก์ชันดั้งเดิม มั่นคง ปลอดภัย ใช้งานถาวร",
      price: "690.00",
      categoryName: "Office",
      image: "office2016_pro",
      key: "O16P-ABCD-EFGH-IJKL-0019",
    },
    {
      name: "Microsoft Access 2021 Retail Key",
      description: "Microsoft Access 2021 สำหรับระบบจัดการฐานข้อมูลในองค์กรและสร้างแอปพลิเคชันอย่างง่าย",
      price: "590.00",
      categoryName: "Office",
      image: "access2021_pro",
      key: "ACC21-ABCD-EFGH-IJKL-0020",
    },
    // Category: Design
    {
      name: "Adobe Creative Cloud All Apps",
      description: "Adobe Creative Cloud All Apps ระยะเวลา 1 ปี พร้อมแอปพลิเคชันสร้างสรรค์งานมากกว่า 20 รายการ",
      price: "1790.00",
      categoryName: "Design",
      image: "adobe_cc",
      key: "ADCC-ABCD-EFGH-IJKL-9999",
    },
    {
      name: "Adobe Photoshop 2024",
      description: "Adobe Photoshop 2024 ระยะเวลา 1 ปี สำหรับตกแต่งภาพ ครีเอทีฟอาร์ต และการออกแบบระดับมืออาชีพ",
      price: "890.00",
      categoryName: "Design",
      image: "adobe_photoshop",
      key: "ADPS-ABCD-EFGH-IJKL-1010",
    },
    {
      name: "Adobe Premiere Pro 2024",
      description: "Adobe Premiere Pro 2024 ระยะเวลา 1 ปี โปรแกรมตัดต่อวิดีโอระดับภาพยนตร์และคอนเทนต์ครีเอเตอร์",
      price: "890.00",
      categoryName: "Design",
      image: "adobe_premiere",
      key: "ADPP-ABCD-EFGH-IJKL-1112",
    },
    {
      name: "Adobe Illustrator 2024",
      description: "Adobe Illustrator 2024 ระยะเวลา 1 ปี สำหรับวาดรูปเวกเตอร์ ออกแบบโลโก้ และสื่อสิ่งพิมพ์",
      price: "890.00",
      categoryName: "Design",
      image: "adobe_illustrator",
      key: "ADIL-ABCD-EFGH-IJKL-1213",
    },
    {
      name: "AutoCAD 2024 (1 Year)",
      description: "AutoCAD 2024 ลิขสิทธิ์แท้ 1 ปี สำหรับสถาปนิกและวิศวกรในการเขียนแบบ 2D/3D คุณภาพสูง",
      price: "4500.00",
      categoryName: "Design",
      image: "autocad_2024",
      key: "ACAD-ABCD-EFGH-IJKL-1314",
    },
    {
      name: "Adobe Acrobat Pro DC (1 Year)",
      description: "Adobe Acrobat Pro DC จัดการ แก้ไข แปลงไฟล์ และเซ็นเอกสาร PDF ได้อย่างมืออาชีพ",
      price: "990.00",
      categoryName: "Design",
      image: "adobe_acrobat",
      key: "ADAC-ABCD-EFGH-IJKL-0021",
    },
    {
      name: "Adobe Lightroom Classic (1 Year)",
      description: "Adobe Lightroom Classic จัดการไฟล์ภาพถ่ายและแต่งสีปรับแสงภาพถ่ายระดับมืออาชีพ",
      price: "790.00",
      categoryName: "Design",
      image: "adobe_lightroom",
      key: "ADLR-ABCD-EFGH-IJKL-0022",
    },
    {
      name: "Adobe After Effects 2024 (1 Year)",
      description: "Adobe After Effects สำหรับการทำ Motion Graphics, Visual Effects และแอนิเมชันระดับเทพ",
      price: "890.00",
      categoryName: "Design",
      image: "adobe_after_effects",
      key: "ADAE-ABCD-EFGH-IJKL-0023",
    },
    {
      name: "Adobe InDesign 2024 (1 Year)",
      description: "Adobe InDesign ออกแบบหน้าหนังสือ นิตยสาร โบรชัวร์ และงานสิ่งพิมพ์ดิจิทัลทุกรูปแบบ",
      price: "790.00",
      categoryName: "Design",
      image: "adobe_indesign",
      key: "ADID-ABCD-EFGH-IJKL-0024",
    },
    {
      name: "CorelDRAW Graphics Suite (1 Year)",
      description: "CorelDRAW ชุดโปรแกรมออกแบบกราฟิกเวกเตอร์ยอดนิยมระดับโลก มีฟังก์ชันการออกแบบครบวงจร",
      price: "1890.00",
      categoryName: "Design",
      image: "coreldraw_suite",
      key: "CDRAW-ABCD-EFGH-IJKL-0025",
    },
    {
      name: "SketchUp Pro (1 Year)",
      description: "SketchUp Pro ลิขสิทธิ์แท้ 1 ปีสำหรับออกแบบสถาปัตยกรรม 3D โครงสร้างอาคารและตกแต่งภายใน",
      price: "2490.00",
      categoryName: "Design",
      image: "sketchup_pro",
      key: "SKP-ABCD-EFGH-IJKL-0026",
    },
    {
      name: "Maya 2024 (1 Year)",
      description: "Autodesk Maya โปรแกรมสร้างโมเดล 3D, แอนิเมชัน และวิชวลเอฟเฟกต์สำหรับอุตสาหกรรมเกมและภาพยนตร์",
      price: "4990.00",
      categoryName: "Design",
      image: "autodesk_maya",
      key: "MAYA-ABCD-EFGH-IJKL-0027",
    },
    // Category: Security
    {
      name: "Kaspersky Total Security",
      description: "Kaspersky Total Security ระยะเวลา 1 ปี สำหรับ 1 อุปกรณ์ ปกป้องไฟล์ ข้อมูลส่วนตัว และการทำธุรกรรมการเงินออนไลน์",
      price: "690.00",
      categoryName: "Security",
      image: "kaspersky_total",
      key: "KASP-ABCD-EFGH-IJKL-1415",
    },
    {
      name: "ESET Smart Security Premium",
      description: "ESET Smart Security Premium ระยะเวลา 1 ปี สำหรับ 1 อุปกรณ์ ป้องกันไวรัส มัลแวร์ และตัวจัดการรหัสผ่าน",
      price: "690.00",
      categoryName: "Security",
      image: "eset_smart",
      key: "ESET-ABCD-EFGH-IJKL-1516",
    },
    {
      name: "Malwarebytes Premium (1 Year)",
      description: "Malwarebytes Premium ป้องกันมัลแวร์เรียกค่าไถ่ (Ransomware) และการโจมตีทางไซเบอร์แบบเรียลไทม์",
      price: "490.00",
      categoryName: "Security",
      image: "malwarebytes_premium",
      key: "MALW-ABCD-EFGH-IJKL-1617",
    },
    {
      name: "Bitdefender Total Security",
      description: "Bitdefender Total Security ลิขสิทธิ์ 1 ปี สำหรับ 3 อุปกรณ์ การปกป้องแบบ Multi-platform ที่ดีที่สุด",
      price: "790.00",
      categoryName: "Security",
      image: "bitdefender_total",
      key: "BITD-ABCD-EFGH-IJKL-1718",
    },
    {
      name: "McAfee Total Protection (1 Year / 1 Device)",
      description: "McAfee Total Protection ปกป้องความเป็นส่วนตัว บล็อกไวรัส ฟิชชิ่งเว็บ สำหรับ 1 อุปกรณ์",
      price: "390.00",
      categoryName: "Security",
      image: "mcafee_1device",
      key: "MCAF-ABCD-EFGH-IJKL-0028",
    },
    {
      name: "McAfee Total Protection (1 Year / 3 Devices)",
      description: "McAfee Total Protection ระบบรักษาความปลอดภัยแบบพรีเมียม สำหรับติดตั้งใช้งาน 3 อุปกรณ์",
      price: "690.00",
      categoryName: "Security",
      image: "mcafee_3devices",
      key: "MCAF3-ABCD-EFGH-IJKL-0029",
    },
    {
      name: "Norton 360 Deluxe (1 Year / 3 Devices)",
      description: "Norton 360 Deluxe ระบบการปกป้องคอมพิวเตอร์และมือถือ 3 เครื่อง พร้อมมีฟังก์ชัน Secure VPN และ Cloud Backup 25GB",
      price: "790.00",
      categoryName: "Security",
      image: "norton_deluxe",
      key: "NORT-ABCD-EFGH-IJKL-0030",
    },
    {
      name: "Avast Premium Security (1 Year / 1 Device)",
      description: "Avast Premium Security แอนตี้ไวรัสยอดนิยมที่สแกนช่องโหว่ความปลอดภัยแบบเรียลไทม์",
      price: "490.00",
      categoryName: "Security",
      image: "avast_premium",
      key: "AVAS-ABCD-EFGH-IJKL-0031",
    },
    {
      name: "AVG Internet Security (1 Year / 1 Device)",
      description: "AVG Internet Security ปกป้องการท่องเว็บ อีเมล ป้องกันมัลแวร์สปายแวร์ได้อย่างดีเยี่ยม",
      price: "390.00",
      categoryName: "Security",
      image: "avg_security",
      key: "AVG-ABCD-EFGH-IJKL-0032",
    },
    {
      name: "Trend Micro Maximum Security (1 Year)",
      description: "Trend Micro ปกป้องอุปกรณ์ด้วยเทคโนโลยี AI ในการตรวจจับภัยคุกคามทางไซเบอร์ที่รวดเร็ว",
      price: "490.00",
      categoryName: "Security",
      image: "trendmicro_max",
      key: "TREND-ABCD-EFGH-IJKL-0033",
    },
    {
      name: "Bitdefender Internet Security (1 Year)",
      description: "Bitdefender Internet Security ปกป้องคอมพิวเตอร์ Windows ของคุณจากมัลแวร์ทุกประเภท มีไฟร์วอลล์ในตัว",
      price: "590.00",
      categoryName: "Security",
      image: "bitdefender_internet",
      key: "BITDI-ABCD-EFGH-IJKL-0034",
    },
    {
      name: "Kaspersky Internet Security (1 Year)",
      description: "Kaspersky Internet Security ป้องกันการสอดแนมผ่านกล้องเว็บแคม และเพิ่มความปลอดภัยในการทำธุรกรรมผ่านเว็บ",
      price: "490.00",
      categoryName: "Security",
      image: "kaspersky_internet",
      key: "KASPI-ABCD-EFGH-IJKL-0035",
    },
    // Category: VPN
    {
      name: "NordVPN Premium 1 Year",
      description: "NordVPN Premium ระยะเวลา 1 ปี ท่องเว็บอย่างเป็นส่วนตัว ปลอดภัย และปลดล็อกเนื้อหาจากทั่วทุกมุมโลก",
      price: "890.00",
      categoryName: "VPN",
      image: "nordvpn_1yr",
      key: "NORD-ABCD-EFGH-IJKL-1819",
    },
    {
      name: "ExpressVPN Premium 1 Year",
      description: "ExpressVPN ลิขสิทธิ์แท้ 1 ปี แบนด์วิดท์ไม่จำกัด ความเร็วสูงสุดสำหรับสตรีมมิ่งและเล่นเกม",
      price: "1590.00",
      categoryName: "VPN",
      image: "expressvpn_1yr",
      key: "EXPR-ABCD-EFGH-IJKL-1920",
    },
    {
      name: "CCleaner Professional Plus",
      description: "CCleaner Professional Plus ระยะเวลา 1 ปี สำหรับ 3 เครื่อง ช่วยล้างไฟล์ขยะและเพิ่มประสิทธิภาพคอมพิวเตอร์ของคุณ",
      price: "390.00",
      categoryName: "VPN",
      image: "ccleaner_pro",
      key: "CCLE-ABCD-EFGH-IJKL-2020",
    },
    {
      name: "Surfshark VPN Premium 1 Year",
      description: "Surfshark VPN ท่องเน็ตไร้พรมแดน บล็อกโฆษณา และสามารถใช้งานได้ไม่จำกัดจำนวนอุปกรณ์พร้อมกัน",
      price: "790.00",
      categoryName: "VPN",
      image: "surfshark_1yr",
      key: "SURF-ABCD-EFGH-IJKL-0036",
    },
    {
      name: "CyberGhost VPN 1 Year",
      description: "CyberGhost VPN ปิดบัง IP Address เข้ารหัสการเชื่อมต่อเครือข่ายความเร็วสูงเพื่อความเป็นส่วนตัวสูงสุด",
      price: "690.00",
      categoryName: "VPN",
      image: "cyberghost_1yr",
      key: "GHOST-ABCD-EFGH-IJKL-0037",
    },
    {
      name: "CCleaner Professional Plus (3 Years)",
      description: "CCleaner Pro Plus แพ็กเกจระยะยาว 3 ปี สำหรับ 3 อุปกรณ์ ล้างไฟล์ขยะและดูแลเครื่องคอมพิวเตอร์ให้เร็วเหมือนใหม่",
      price: "990.00",
      categoryName: "VPN",
      image: "ccleaner_pro_3yr",
      key: "CCLE3-ABCD-EFGH-IJKL-0038",
    },
    {
      name: "IObit Driver Booster Pro (1 Year)",
      description: "IObit Driver Booster Pro ค้นหาและอัปเดตไดรเวอร์ที่ล้าสมัยของคอมพิวเตอร์ให้อัปเดตล่าสุดโดยอัตโนมัติ",
      price: "290.00",
      categoryName: "VPN",
      image: "driver_booster_pro",
      key: "IODB-ABCD-EFGH-IJKL-0039",
    },
    {
      name: "Advanced SystemCare Pro (1 Year)",
      description: "Advanced SystemCare Pro โปรแกรมปรับแต่งความแรงและดูแลความปลอดภัยระบบ Windows ในคลิกเดียว",
      price: "290.00",
      categoryName: "VPN",
      image: "advanced_systemcare",
      key: "ASC-ABCD-EFGH-IJKL-0040",
    },
    {
      name: "Malwarebytes Premium (2 Years)",
      description: "Malwarebytes Premium ปกป้องคอมพิวเตอร์ของคุณระยะยาว 2 ปี ตรวจจับไวรัสสปายแวร์และแรนซัมแวร์ได้ยอดเยี่ยม",
      price: "890.00",
      categoryName: "VPN",
      image: "malwarebytes_2yr",
      key: "MALW2-ABCD-EFGH-IJKL-0041",
    },
    {
      name: "EaseUS Data Recovery Wizard Pro",
      description: "EaseUS Data Recovery Wizard กู้คืนข้อมูล ไฟล์ภาพ เอกสารที่ถูกลบหรือสูญหายจากการฟอร์แมตได้อย่างง่ายดาย",
      price: "1490.00",
      categoryName: "VPN",
      image: "easeus_recovery",
      key: "EAS-ABCD-EFGH-IJKL-0042",
    },
    {
      name: "Partition Wizard Pro",
      description: "MiniTool Partition Wizard Pro จัดการพาร์ทิชัน ฮาร์ดดิสก์ SSD โคลนดิสก์และกู้คืนพาร์ทิชันระดับโปร",
      price: "990.00",
      categoryName: "VPN",
      image: "partition_wizard",
      key: "PART-ABCD-EFGH-IJKL-0043",
    },
    {
      name: "Windscribe VPN Pro 1 Year",
      description: "Windscribe VPN ปกป้องความเป็นส่วนตัว ท่องเน็ตไร้พรมแดน ปลอดภัยจากการดักจับข้อมูล",
      price: "590.00",
      categoryName: "VPN",
      image: "windscribe_pro",
      key: "WIND-ABCD-EFGH-IJKL-0044",
    },
  ];


  for (const prod of productsData) {
    const createdProduct = await prisma.product.create({
      data: {
        name: prod.name,
        description: prod.description,
        price: money(prod.price),
        stock: 10,
        image: prod.image,
        key: prod.key ? encryptKey(prod.key) : null,
        categoryId: categories[prod.categoryName],
      },
    });

    // Create 10 product keys for this product
    for (let i = 1; i <= 10; i++) {
      await prisma.productKey.create({
        data: {
          productKey: encryptKey(generateRealisticProductKey()),
          salesStatus: "AVAILABLE",
          productId: createdProduct.id,
        },
      });
    }
  }

  console.log("Seeding test orders and reviews...");
  const seededProducts = await prisma.product.findMany();

  const order = await prisma.order.create({
    data: {
      userId: customers[0].id,
      total: money("790.00"),
      status: "COMPLETED",
      orderItems: {
        create: {
          productId: seededProducts[0].id,
          quantity: 1,
          price: seededProducts[0].price,
          orderStatus: "COMPLETED",
          userId: customers[0].id,
        },
      },
    },
  });

  // Link one of the keys of seededProducts[0] to this order item
  const orderItem = await prisma.orderItem.findFirst({
    where: { orderId: order.id },
  });
  if (orderItem) {
    const key = await prisma.productKey.findFirst({
      where: { productId: seededProducts[0].id, salesStatus: "AVAILABLE" },
    });
    if (key) {
      await prisma.productKey.update({
        where: { id: key.id },
        data: {
          salesStatus: "SOLD",
          orderDetailId: orderItem.id,
        },
      });
    }
  }

  await prisma.review.create({
    data: {
      userId: customers[0].id,
      productId: seededProducts[0].id,
      rating: 5,
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
