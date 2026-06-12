# Project Context: Digital Software License & Tech Asset Store

This document defines the requirements, design guidelines, and scope for the software license e-commerce website.

## 1. Project Overview
- **Objective**: Build a premium web application for selling Digital Software Licenses and Tech Assets (e.g., Windows keys, Microsoft Office, Adobe Creative Cloud, Antivirus, VPNs).
- **Core Technology Stack**:
  - **Framework**: Next.js 16 (App Router)
  - **Language**: TypeScript
  - **Styling**: Vanilla CSS (CSS Modules) - *No Tailwind CSS*
  - **Package Manager**: npm

---

## 2. Design & Aesthetics (SoftKeyStore Style)

The design must feel premium, secure, and modern, drawing inspiration from the layout and color palette of `SoftKeyStore`.

### Theme & Colors
- **Primary Color**: Dark Navy Blue (`#0a192f` / `#0d1b2a`) for headers, navigation, and primary branding to build trust and security.
- **Background**: Clean white (`#ffffff`) and soft light gray (`#f4f6f9`) for sections.
- **Accents**: 
  - Vibrant blue (`#0066cc` / `#0052cc`) for primary buttons and links.
  - Success green (`#2ec4b6` / `#28a745`) for product stock availability indicators.

### Key Page Layouts & Components

#### Header & Navigation
- Dark Navy Blue background.
- Brand logo on the left: **SoftKeyStore** (Sub-label: "Digital Software License & Tech Asset").
- Center: Categories dropdown (หมวดหมู่สินค้า), All products (สินค้าทั้งหมด), How to buy (วิธีการสั่งซื้อ), Shipping (การจัดส่ง), Articles (บทความ), Contact us (ติดต่อเรา).
- Right: Search icon, Account icon, and Shopping Cart icon with a red badge counter.

#### Home Page (Hero & Product Grid)
- **Hero Slider / Banner**: Clean slideshow showing key benefits:
  1. Instant automated delivery (จัดส่งอัตโนมัติ รับคีย์ในไม่กี่วินาที).
  2. 100% Genuine keys (คีย์แท้ 100% ใช้งานได้จริง อัปเดตได้ ปลอดภัย).
  3. Secure Payment options (ชำระเงินปลอดภัย รองรับหลายช่องทาง).
  4. 24/7 Customer Support (บริการช่วยเหลือ 24/7 พร้อมดูแลคุณทุกวัน).
  5. Easy installation (ใช้งานง่าย ติดตั้งสะดวก เปิดใช้งานได้ทันที).
- **Product Grid (Recommended Products)**:
  - Responsive card layout with rounded corners and subtle shadows.
  - Card covers should use vibrant gradients specific to the brand (e.g., Windows 11/10 = blue gradient, Adobe CC = sunset orange/yellow/red, Photoshop = dark blue, Kaspersky = green gradient, NordVPN = light blue).
  - Displays product category, title (e.g., Windows 11 Pro), sales counter (e.g., "12580+ ขายแล้ว"), and price.

#### Product Detail Page
- **Breadcrumbs**: Home > Category > Product Name.
- **Product Box Art (Left)**: Clear visual branding showing software icon/box art.
- **Product Details & Configurator (Right)**:
  - Product Title & Star rating reviews counter.
  - Pricing and stock status ("มีสินค้า พร้อมจัดส่ง").
  - **Customizer Checkboxes**: Ability to select specific components of a package (e.g., for Office 2021: select Word, Excel, PowerPoint individually with dynamic pricing update).
  - Quantity selector and action buttons:
    - **Buy Now** (Solid blue button with flash/delivery icon).
    - **Add to Cart** (White button with blue border and cart icon).
  - Trust elements: "Genuine 100%", "Auto-delivery in seconds", "24/7 Support".
  - Secure payment badges: Visa, Mastercard, PromptPay, TrueMoney.
- **Information Tabs (Bottom)**:
  - Product Description (รายละเอียดสินค้า).
  - How to use (วิธีใช้งาน).
  - Reviews (รีวิว).

---

## 3. Product Catalog (Core Products)
1. **Operating Systems**:
   - Windows 11 Pro (790.00 ฿)
   - Windows 10 Pro (590.00 ฿)
2. **Office Suites**:
   - Microsoft Office 2021 Professional Plus (1,190.00 ฿)
3. **Design & Creativity**:
   - Adobe Creative Cloud All Apps (1,790.00 ฿)
   - Adobe Photoshop 2024 (890.00 ฿)
   - Adobe Premiere Pro 2024 (890.00 ฿)
4. **Security & Utilities**:
   - Kaspersky Total Security (690.00 ฿)
   - ESET Smart Security Premium (690.00 ฿)
   - CCleaner Professional Plus (390.00 ฿)
5. **VPN / Network**:
   - NordVPN Premium 1 Year (890.00 ฿)

---

## 4. System Use Cases & Roles

Based on the system architecture diagrams, the platform defines three main actors with distinct sets of use cases:

### Actor 1: ผู้ใช้ทั่วไป (General User / Guest)
- **สมัครสมาชิก** (Register / Sign Up)
- **ดูรายการสินค้า** (View product list)
- **ดูรายละเอียดสินค้า** (View product details)
- **ค้นหาสินค้า** (Search products)

### Actor 2: ลูกค้า (Customer / Registered User)
- **เข้าสู่ระบบ** (Login)
- **ค้นหาสินค้า** (Search products)
- **ดูรายการสินค้า** (View product list)
- **ดูรายละเอียดสินค้า** (View product details)
- **เพิ่มสินค้าลงในตะกร้า** (Add product to cart)
- **จัดการตะกร้าสินค้า** (Manage shopping cart)
- **ทำรายการสั่งซื้อสินค้า** (Checkout / Place Order)
  - `<<include>>` **ชำระเงิน** (Make payment)
- **ดูประวัติการสั่งซื้อ** (View order history)
  - `<<extend>>` **รีวิว** (Write a review)
- **ดูหน้า Profile** (View Profile page)

### Actor 3: ผู้จัดการระบบ (System Administrator / Admin)
- **เข้าสู่ระบบ** (Login)
- **ดูรายการสั่งซื้อทั้งหมด** (View all orders)
- **จัดการรายการสินค้า** (Manage products - Add, Edit, Delete)
- **จัดการคีย์ซอฟต์แวร์** (Manage software keys)
- **จัดโปรโมชั่นสินค้า** (Manage product promotions/discounts)
- **สามารถดูจำนวนสมาชิก** (View member count/details)
