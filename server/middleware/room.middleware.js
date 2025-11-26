import { decryptAccess } from "../utils/accessToken.utils.js";

export const validateRoomAccess = (req, res, next) => {
  const token = req.query.token;

  const payload = decryptAccess(token);
  if (!payload) return res.status(401).json({ error: "Invalid token" });

  if (payload.expires < Date.now())
    return res.status(401).json({ error: "Token expired" });

  req.roomId = payload.roomId;
  req.access = payload.access;

  next();
};
