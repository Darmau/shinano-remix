/**
 * 取消订阅 Token 生成和验证工具
 * 与 Edge Function 保持一致，使用 HS256 JWT
 */

const MAX_TOKEN_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

interface UnsubscribeTokenPayload {
  comment_id: number;
  timestamp: number;
  iat?: number;
}

/**
 * 生成取消订阅 Token
 * @param commentId 评论 ID
 * @param secret 签名密钥
 * @returns JWT token
 */
export async function generateUnsubscribeToken(
  commentId: number,
  secret: string
): Promise<string> {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Date.now();
  const payload: UnsubscribeTokenPayload = {
    comment_id: commentId,
    timestamp: now,
    iat: Math.floor(now / 1000),
  };

  const encodedHeader = base64UrlEncode(
    textEncoder.encode(JSON.stringify(header))
  );
  const encodedPayload = base64UrlEncode(
    textEncoder.encode(JSON.stringify(payload))
  );
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(signingInput)
  );
  const encodedSignature = base64UrlEncode(signatureBuffer);

  return `${signingInput}.${encodedSignature}`;
}

/**
 * 验证并解析取消订阅 Token
 * @param token JWT 字符串
 * @param secret 签名密钥
 * @param maxAgeMs Token 最大有效期（毫秒），默认 7 天
 * @returns 解析的评论 ID，如果验证失败返回 null
 */
export async function verifyUnsubscribeToken(
  token: string,
  secret: string,
  maxAgeMs: number = MAX_TOKEN_AGE_MS
): Promise<number | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("Unsubscribe token format invalid");
      return null;
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    const headerJson = base64UrlDecodeToString(encodedHeader);
    const header = JSON.parse(headerJson) as { alg?: string };
    if (header?.alg !== "HS256") {
      console.warn("Unexpected unsubscribe token algorithm");
      return null;
    }

    const key = await crypto.subtle.importKey(
      "raw",
      textEncoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      textEncoder.encode(signingInput)
    );
    const expectedSignature = new Uint8Array(expectedSignatureBuffer);
    const providedSignature = base64UrlDecode(encodedSignature);

    if (!timingSafeEqual(expectedSignature, providedSignature)) {
      console.warn("Unsubscribe token signature mismatch");
      return null;
    }

    const payloadJson = base64UrlDecodeToString(encodedPayload);
    const payload = JSON.parse(payloadJson) as UnsubscribeTokenPayload;

    const commentIdRaw = payload.comment_id;
    const timestampRaw = payload.timestamp;

    const commentId =
      typeof commentIdRaw === "number"
        ? commentIdRaw
        : typeof commentIdRaw === "string"
          ? Number.parseInt(commentIdRaw, 10)
          : Number.NaN;

    const issuedAt =
      typeof timestampRaw === "number"
        ? timestampRaw
        : typeof timestampRaw === "string"
          ? Number.parseInt(timestampRaw, 10)
          : Number.NaN;

    if (!Number.isFinite(commentId) || !Number.isFinite(issuedAt)) {
      console.warn("Unsubscribe token payload invalid");
      return null;
    }

    if (Date.now() - issuedAt > maxAgeMs) {
      console.warn("Unsubscribe token expired");
      return null;
    }

    return commentId;
  } catch (error) {
    console.error("Failed to verify unsubscribe token:", error);
    return null;
  }
}

function base64UrlEncode(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoaUniversal(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(input: string): Uint8Array {
  let normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (normalized.length % 4)) % 4;
  if (padding !== 0) {
    normalized += "=".repeat(padding);
  }
  const binary = atobUniversal(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlDecodeToString(input: string): string {
  const bytes = base64UrlDecode(input);
  return textDecoder.decode(bytes);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

function btoaUniversal(value: string): string {
  if (typeof btoa === "function") {
    return btoa(value);
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "binary").toString("base64");
  }
  throw new Error("btoa is not available in this environment");
}

function atobUniversal(value: string): string {
  if (typeof atob === "function") {
    return atob(value);
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "base64").toString("binary");
  }
  throw new Error("atob is not available in this environment");
}



