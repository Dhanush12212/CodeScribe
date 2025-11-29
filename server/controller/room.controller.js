import { rooms, createRoom } from "../socket/room.js";
import { encryptAccess } from "../utils/accessToken.utils.js"; 
import { getBaseUrl } from "../utils/env.js";

const createRoomController = (req, res) => {
  const { roomId, userId } = req.body;
  if (!roomId || !userId) return res.status(400).json({ error: "Missing roomId or userId" });

  createRoom(roomId, userId);

  const token = encryptAccess({
    roomId,
    access: "write",
    userId,
    expires: Date.now() + 12 * 60 * 60 * 1000, 
  });

  return res.json({ success: true, token });
};
 
const generateRoomLink = async (req, res) => {
  try {
    const { roomId, access, userId } = req.body;
    if (!roomId || !access || !userId) {
      return res.status(400).json({ error: "Missing roomId or access or userId" });
    }

    const room = rooms.get(roomId); 
    const finalAccess = room?.owner === userId ? "write" : access;

    const token = encryptAccess({
      roomId,
      access: finalAccess,
      userId,
      expires: Date.now() + 12 * 60 * 60 * 1000,
    });

    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/CodeScribe?token=${encodeURIComponent(
      token
    )}`;
    res.json({ url, token });
  } catch (err) {
    console.error("generateRoomLink error:", err);
    return res.status(500).json({ error: "Failed to generate link" });
  }
};

export { 
  createRoomController,
  generateRoomLink
}