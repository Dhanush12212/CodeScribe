import { encryptAccess } from "../utils/accessToken.utils.js";
export const generateRoomLink = async (req, res) => {
  try { 

    const { roomId, access } = req.body;

    if (!roomId || !access) { 
      return res.status(400).json({ error: "Missing roomId or access" });
    } 

    const token = encryptAccess( roomId, access ); 

    const frontendURL = `${process.env.LOCAL_URL}/CodeScribe/${roomId}?token=${encodeURIComponent(token)}`; 
    res.json({ url: frontendURL });

  } catch (err) { 
    return res.status(500).json({ error: "Failed to generate link" });
  }
};

