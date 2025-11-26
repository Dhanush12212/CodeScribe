import crypto from "crypto";
const SECRET = process.env.ACCESS_SECRET_KEY;

export const encryptAccess = (roomId, access) => {
  const json = JSON.stringify({ r: roomId, a: access });
  return Buffer.from(json).toString("base64url");
};

export const decryptAccess = (token) => {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};
