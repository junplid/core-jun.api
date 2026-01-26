import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHmac,
} from "crypto";

const MASTER_KEY = Buffer.from(process.env.MASTER_KEY!, "hex");
const HASH_SECRET = Buffer.from(process.env.HASH_SECRET!, "hex");

export function encrypt(data: any) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", MASTER_KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf-8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypte(data: string) {
  const buffer = Buffer.from(data, "base64");
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);

  const decipher = createDecipheriv("aes-256-gcm", MASTER_KEY, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, undefined, "utf-8");
  return JSON.parse((decrypted += decipher.final("utf-8")));
}

export function hashForLookup(value: string) {
  return createHmac("sha256", HASH_SECRET).update(value).digest("hex");
}
