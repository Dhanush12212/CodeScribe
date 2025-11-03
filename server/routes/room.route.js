import express from "express";
import { rooms } from "../socket/room.js";  

const router = express.Router();

router.get("/:roomId", (req, res) => {
  const { roomId } = req.params;
  const exists = rooms.has(roomId);
  res.json({ exists });
});

export default router;
