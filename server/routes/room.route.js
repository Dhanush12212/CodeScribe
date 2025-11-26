import express from "express";
import { rooms } from "../socket/room.js";  
import { generateRoomLink } from '../controller/room.controller.js'

const router = express.Router();

router.route('/generateLink').post(generateRoomLink); 

router.get("/:roomId", (req, res) => {
  const { roomId } = req.params;
  const exists = rooms.has(roomId);
  res.json({ exists });
});


export default router;
