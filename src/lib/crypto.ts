// lib/crypto.ts
import crypto from "crypto";

const algorithm = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

// secretKey should be a 32-byte Buffer or base64 string
const key = Buffer.from(process.env.CRYPTO_KEY!, "base64");
if (key.length !== 32) throw new Error("CRYPTO_KEY must be 32 bytes (base64)");

// Encrypt plaintext → output "iv~ciphertext~tag" base64 string
export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, encrypted, tag]).toString("base64");
}

// Decrypt "iv~ciphertext~tag" → plaintext
export function decrypt(enc: string): string {
  const data = Buffer.from(enc, "base64");
  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(data.length - TAG_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH, data.length - TAG_LENGTH);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
