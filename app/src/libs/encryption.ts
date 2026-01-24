import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

// MASTER KEY (32 bytes)
const MASTER_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, "hex");

export function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, MASTER_KEY, iv);

  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");

  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("base64"),
    content: encrypted,
    tag: tag.toString("base64"),
  };
}

export function decrypt(payload: { iv: string; content: string; tag: string }) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    MASTER_KEY,
    Buffer.from(payload.iv, "base64"),
  );

  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));

  let decrypted = decipher.update(payload.content, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
