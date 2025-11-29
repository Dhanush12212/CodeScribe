import crypto from "crypto";

const SECRET = process.env.ACCESS_TOKEN_SECRET || "codescribe_dev_secret";
const ALGO = "sha256";  

export function encryptAccess(payload = {}) {
  const body = {
    roomId: payload.roomId,
    access: payload.access,
    userId: payload.userId,
    expires: payload.expires ?? Date.now() + 12 * 60 * 60 * 1000,  
  };
  const json = JSON.stringify(body);
  const signature = crypto.createHmac(ALGO, SECRET).update(json).digest("base64url");
  const token = Buffer.from(json).toString("base64url") + "." + signature;
  return token;
}
 
export function decryptAccess(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const jsonB64 = parts[0];
    const sig = parts[1];
    const json = Buffer.from(jsonB64, "base64url").toString("utf8");
    const expected = crypto.createHmac(ALGO, SECRET).update(json).digest("base64url");
    if (expected !== sig) return null;
    const payload = JSON.parse(json);
    return payload;
  } catch (err) {
    return null;
  }
}
