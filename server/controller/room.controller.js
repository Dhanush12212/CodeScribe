import { rooms, createRoom } from "../socket/room.js";
import { encryptAccess } from "../utils/accessToken.utils.js"; 
import { getBaseUrl } from "../utils/env.js";

const createRoomController = (req, res) => {
  const { roomId } = req.body;
  if (!roomId) return res.status(400).json({ error: "Missing roomId" });

  createRoom(roomId);  

  const token = encryptAccess({
    roomId,
    access: "write", 
    expires: Date.now() + 12 * 60 * 60 * 1000,  
  });

  return res.json({ success: true, token });
};

const generateRoomLink = async (req, res) => {
  try {
    const { roomId, access } = req.body;
    if (!roomId || !access) {
      return res.status(400).json({ error: "Missing roomId or access" });
    }
 
    const validAccessTypes = ["write", "read"];
    if (!validAccessTypes.includes(access)) {
      return res.status(400).json({ error: "Invalid access type" });
    }

    const token = encryptAccess({
      roomId,
      access,
      expires: Date.now() + 12 * 60 * 60 * 1000,  
    });

    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/CodeScribe?token=${encodeURIComponent(token)}`;
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