import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "fallback_secret_key_which_must_be_32_bytes_long_!!!!!";
const ALGORITHM = "aes-256-cbc";

// Helper to ensure key is exactly 32 bytes by hashing the secret
function getSecretKey() {
  return crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
}

export function encryptKey(text: string): string {
  if (!text) return "";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decryptKey(encryptedText: string): string {
  if (!encryptedText) return "";
  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 2) {
      // Return as is if it doesn't match the encrypted format (for legacy compatibility)
      return encryptedText;
    }
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return encryptedText;
  }
}
