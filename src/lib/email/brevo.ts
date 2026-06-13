import "server-only";

interface PasswordResetOtpEmail {
  to: string;
  name: string;
  otp: string;
}

export class PasswordResetEmailError extends Error {
  constructor() {
    super("Password reset email delivery failed");
    this.name = "PasswordResetEmailError";
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export async function sendPasswordResetOtp(
  message: PasswordResetOtpEmail,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || "SoftKeyStore";

  if (!apiKey || !senderEmail) {
    throw new PasswordResetEmailError();
  }

  const safeName = escapeHtml(message.name || message.to);
  let response: Response;
  try {
    response = await fetchImpl("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: message.to, name: message.name }],
        subject: "รหัส OTP สำหรับรีเซ็ตรหัสผ่าน SoftKeyStore",
        textContent: `รหัส OTP ของคุณคือ ${message.otp} รหัสนี้มีอายุ 10 นาที หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน ให้ละเว้นอีเมลนี้`,
        htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#152033">
            <h1 style="color:#071a3a">SoftKeyStore</h1>
            <p>สวัสดี ${safeName}</p>
            <p>ใช้รหัสนี้เพื่อรีเซ็ตรหัสผ่านของคุณ:</p>
            <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0969da">${message.otp}</p>
            <p>รหัสนี้มีอายุ 10 นาที และใช้ได้ครั้งเดียว</p>
            <p style="color:#526071">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน ให้ละเว้นอีเมลนี้</p>
          </div>
        `,
      }),
    });
  } catch {
    throw new PasswordResetEmailError();
  }

  if (!response.ok) {
    throw new PasswordResetEmailError();
  }
}
