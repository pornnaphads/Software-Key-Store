import "server-only";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export type OrderEmailData = {
  customerName: string;
  customerEmail: string;
  orderId: number;
  orderDate: Date;
  items: Array<{
    productName: string;
    quantity: number;
    price: string;
    keys: string[];
  }>;
  total: string;
  giftMessage?: string | null;
  giftSenderName?: string | null;
};

function formatThaiDate(date: Date): string {
  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ];
  const d = date.getDate();
  const m = thaiMonths[date.getMonth()];
  const y = date.getFullYear() + 543;
  const h = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${d} ${m} ${y} เวลา ${h}:${min} น.`;
}

function buildOrderEmailHtml(data: OrderEmailData): string {
  const itemsHtml = data.items
    .map((item) => {
      const keysHtml =
        item.keys.length > 0
          ? item.keys
              .map(
                (key) =>
                  `<div style="background:#1a1a2e;color:#7dd3fc;font-family:monospace;font-size:15px;font-weight:bold;
                    padding:12px 20px;border-radius:8px;letter-spacing:2px;text-align:center;margin:6px 0;
                    border:1px solid #3b82f6;word-break:break-all;">${key}</div>`,
              )
              .join("")
          : `<div style="color:#f59e0b;font-size:13px;padding:8px 0;">⏳ กำลังเตรียมรหัส — ระบบจะส่งให้ภายใน 24 ชั่วโมง</div>`;
      return `
        <tr>
          <td style="padding:16px;border-bottom:1px solid #e2e8f0;vertical-align:top;">
            <div style="font-weight:600;color:#1e293b;font-size:14px;">${item.productName}</div>
            <div style="color:#64748b;font-size:12px;margin-top:2px;">จำนวน: ${item.quantity} ชิ้น</div>
            <div style="margin-top:10px;">${keysHtml}</div>
          </td>
          <td style="padding:16px;border-bottom:1px solid #e2e8f0;text-align:right;vertical-align:top;white-space:nowrap;">
            <span style="font-weight:700;color:#0f172a;font-size:15px;">${Number(item.price).toLocaleString("th-TH", { minimumFractionDigits: 2 })} ฿</span>
          </td>
        </tr>
      `;
    })
    .join("");

  const orderIdFormatted = `#ORD-${data.orderDate.getFullYear()}${(data.orderDate.getMonth() + 1).toString().padStart(2, "0")}-${data.orderId.toString().padStart(4, "0")}`;

  return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ยืนยันคำสั่งซื้อ</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                🔑 SoftKey Store
              </div>
              <div style="color:#bfdbfe;font-size:13px;margin-top:6px;">ซอฟต์แวร์ลิขสิทธิ์แท้ ส่งรหัสดิจิทัลทันที</div>
            </td>
          </tr>

          <!-- Success / Gift Banner -->
          ${data.giftMessage ? `
          <tr>
            <td style="background:#ffffff;padding:28px 40px 0;">
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 20px;text-align:left;">
                <div style="font-weight:700;color:#1e40af;font-size:16px;margin-bottom:8px;">
                  🎁 คุณได้รับของขวัญจาก ${data.giftSenderName || "เพื่อนของคุณ"}!
                </div>
                <div style="color:#1e3a8a;font-size:14px;font-style:italic;background:#ffffff;padding:12px;border-radius:8px;border-left:4px solid #3b82f6;line-height:1.5;margin-top:6px;">
                  "${data.giftMessage}"
                </div>
              </div>
            </td>
          </tr>
          ` : `
          <tr>
            <td style="background:#ffffff;padding:28px 40px 0;">
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:12px;">
                <span style="font-size:24px;">✅</span>
                <div>
                  <div style="font-weight:700;color:#15803d;font-size:16px;">ชำระเงินสำเร็จแล้ว!</div>
                  <div style="color:#166534;font-size:13px;margin-top:2px;">ขอบคุณที่ไว้วางใจ SoftKey Store นะคะ</div>
                </div>
              </div>
            </td>
          </tr>
          `}

          <!-- Order Info -->
          <tr>
            <td style="background:#ffffff;padding:20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:4px 0;">
                    <span style="color:#64748b;font-size:13px;">เลขที่คำสั่งซื้อ</span>
                    <span style="float:right;font-weight:700;color:#1d4ed8;font-size:13px;">${orderIdFormatted}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">
                    <span style="color:#64748b;font-size:13px;">ลูกค้า</span>
                    <span style="float:right;font-weight:600;color:#1e293b;font-size:13px;">${data.customerName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;">
                    <span style="color:#64748b;font-size:13px;">วันที่สั่งซื้อ</span>
                    <span style="float:right;font-weight:600;color:#1e293b;font-size:13px;">${formatThaiDate(data.orderDate)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="background:#ffffff;padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;" />
            </td>
          </tr>

          <!-- Product Keys Section -->
          <tr>
            <td style="background:#ffffff;padding:24px 40px 8px;">
              <div style="font-weight:700;color:#1e293b;font-size:16px;margin-bottom:4px;">🛍️ รายการสินค้าและรหัสของคุณ</div>
              <div style="color:#64748b;font-size:13px;">กรุณาเก็บรหัสไว้ในที่ปลอดภัย</div>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <thead>
                  <tr style="background:#f8fafc;">
                    <th style="padding:12px 16px;text-align:left;font-size:12px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">สินค้า</th>
                    <th style="padding:12px 16px;text-align:right;font-size:12px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">ราคา</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr style="background:#f8fafc;">
                    <td style="padding:14px 16px;font-weight:700;color:#1e293b;">ยอดรวมทั้งหมด</td>
                    <td style="padding:14px 16px;text-align:right;font-weight:800;color:#1d4ed8;font-size:18px;">${Number(data.total).toLocaleString("th-TH", { minimumFractionDigits: 2 })} ฿</td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>

          <!-- How to Activate -->
          <tr>
            <td style="background:#ffffff;padding:0 40px 28px;">
              <div style="background:#eff6ff;border-radius:12px;padding:20px 24px;">
                <div style="font-weight:700;color:#1e3a5f;font-size:14px;margin-bottom:12px;">📋 วิธีใช้งานรหัสสินค้า</div>
                <ol style="margin:0;padding-left:20px;color:#1e40af;font-size:13px;line-height:1.8;">
                  <li>คัดลอกรหัสผลิตภัณฑ์จากอีเมลนี้</li>
                  <li>เปิดโปรแกรมที่ซื้อ แล้วเลือก "ใช้งาน" หรือ "Activate"</li>
                  <li>วางรหัสแล้วยืนยัน</li>
                  <li>หากมีปัญหาติดต่อทีมงานผ่านหน้าเว็บได้เลย</li>
                </ol>
              </div>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td style="background:#ffffff;padding:0 40px 28px;text-align:center;">
              <div style="color:#64748b;font-size:13px;">
                มีปัญหาหรือต้องการความช่วยเหลือ? 
                <a href="https://softkeystore.com/contact" style="color:#1d4ed8;font-weight:600;text-decoration:none;">ติดต่อเรา</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1e3a5f;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
              <div style="color:#93c5fd;font-size:13px;">© 2025 SoftKey Store · ซอฟต์แวร์ลิขสิทธิ์แท้</div>
              <div style="color:#60a5fa;font-size:12px;margin-top:4px;">อีเมลนี้ส่งอัตโนมัติ กรุณาอย่าตอบกลับ</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

export async function sendOrderConfirmationEmail(
  data: OrderEmailData,
): Promise<void> {
  const from = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  console.log("[Mailer] GMAIL_USER:", from ? `${from.slice(0, 4)}****` : "❌ NOT SET");
  console.log("[Mailer] GMAIL_APP_PASSWORD:", pass ? "✅ set" : "❌ NOT SET");

  if (!from || !pass) {
    console.warn("[Mailer] ❌ Gmail credentials missing — skipping email");
    return;
  }

  // Re-create transporter with current env vars (important after hot-reload)
  const t = nodemailer.createTransport({
    service: "gmail",
    auth: { user: from, pass },
  });

  // Verify connection before sending
  try {
    await t.verify();
    console.log("[Mailer] ✅ SMTP connection verified");
  } catch (verifyErr) {
    console.error("[Mailer] ❌ SMTP verify failed:", verifyErr);
    return;
  }

  const orderIdFormatted = `#ORD-${data.orderDate.getFullYear()}${(data.orderDate.getMonth() + 1).toString().padStart(2, "0")}-${data.orderId.toString().padStart(4, "0")}`;
  const subject = data.giftMessage
    ? `🎁 คุณได้รับของขวัญจาก ${data.giftSenderName || "เพื่อนของคุณ"} — รหัสสินค้าของคุณมาแล้ว!`
    : `✅ ยืนยันคำสั่งซื้อ ${orderIdFormatted} — รหัสสินค้าของคุณมาแล้ว!`;

  try {
    const info = await t.sendMail({
      from: `"SoftKey Store" <${from}>`,
      to: data.customerEmail,
      subject,
      html: buildOrderEmailHtml(data),
    });
    console.log("[Mailer] ✅ Email sent to:", data.customerEmail, "| messageId:", info.messageId);
  } catch (sendErr) {
    console.error("[Mailer] ❌ Send failed:", sendErr);
    throw sendErr;
  }
}
