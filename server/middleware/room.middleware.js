import { decryptAccess } from "../utils/accessToken.utils.js";
import { rooms } from "../socket/room.js";

export const validateRoomAccess = (req, res, next) => {
  const token = req.query.token;
  const payload = decryptAccess(token);

  if (!payload) return res.status(401).json({ error: "Invalid token" });
  if (payload.expires < Date.now()) return res.status(401).json({ error: "Expired token" });

  const room = rooms.get(payload.roomId);
 
  if (room && payload.userId === room.owner) {
    payload.access = "write";
  }

  req.roomId = payload.roomId;
  req.userId = payload.userId;
  req.access = payload.access;

  next();
};
