
import { createHmac } from "node:crypto";

export function createMessageFingerprint(message) {
  const key = process.env.MESSAGE_FINGERPRINT_KEY;

  if (!key) {
    throw new Error("MESSAGE_FINGERPRINT_KEY is not configured");
  }

  const normalized = message
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ");

  return createHmac("sha256", key)
    .update(normalized, "utf8")
    .digest("hex");
}
