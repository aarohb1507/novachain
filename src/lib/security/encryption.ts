import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const AES_ALGO = "aes-256-gcm";

function getKey() {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error("ENCRYPTION_KEY is required for credential encryption");
  }

  const keyBuffer = Buffer.from(key, "base64");
  if (keyBuffer.length !== 32) {
    throw new Error("ENCRYPTION_KEY must decode to 32 bytes (base64 encoded)");
  }

  return keyBuffer;
}

export function encryptSecret(plainText: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(AES_ALGO, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(":");
}

export function decryptSecret(payload: string) {
  const [ivEncoded, authTagEncoded, encryptedEncoded] = payload.split(":");

  if (!ivEncoded || !authTagEncoded || !encryptedEncoded) {
    throw new Error("Invalid encrypted payload format");
  }

  const decipher = createDecipheriv(AES_ALGO, getKey(), Buffer.from(ivEncoded, "base64"));
  decipher.setAuthTag(Buffer.from(authTagEncoded, "base64"));

  const plain = Buffer.concat([
    decipher.update(Buffer.from(encryptedEncoded, "base64")),
    decipher.final(),
  ]);

  return plain.toString("utf8");
}