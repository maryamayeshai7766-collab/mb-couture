import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "mb_couture_admin";
export const ORDER_CONFIRMATION_COOKIE = "mb_couture_order_confirmation";

function signingSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }
  return secret;
}

type SignedPayload = {
  scope: "admin" | "order";
  subject: string;
  expiresAt: number;
};

export function createSignedToken(
  scope: SignedPayload["scope"],
  subject: string,
  lifetimeSeconds: number
) {
  const payload = Buffer.from(
    JSON.stringify({
      scope,
      subject,
      expiresAt: Math.floor(Date.now() / 1000) + lifetimeSeconds,
    } satisfies SignedPayload)
  ).toString("base64url");
  const signature = createHmac("sha256", signingSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySignedToken(
  token: string | undefined,
  expectedScope: SignedPayload["scope"]
) {
  if (!token) return null;
  const [payload, providedSignature, extra] = token.split(".");
  if (!payload || !providedSignature || extra) return null;

  try {
    const expectedSignature = createHmac("sha256", signingSecret())
      .update(payload)
      .digest();
    const signature = Buffer.from(providedSignature, "base64url");
    if (
      signature.length !== expectedSignature.length ||
      !timingSafeEqual(signature, expectedSignature)
    ) {
      return null;
    }

    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as SignedPayload;
    if (
      parsed.scope !== expectedScope ||
      typeof parsed.subject !== "string" ||
      parsed.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return parsed.subject;
  } catch {
    return null;
  }
}
