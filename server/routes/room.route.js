// backend/src/routes/room.routes.js
import express from "express";
import { generateRoomLink, createRoomController } from "../controller/room.controller.js";
import { validateRoomAccess } from "../middleware/room.middleware.js";
import { rooms } from "../socket/room.js";

const router = express.Router();

router.post("/createRoom", createRoomController);
router.post("/generateLink", generateRoomLink);

router.get("/validateRoomAccess", validateRoomAccess, (req, res) => {
  res.json({
    roomId: req.roomId,
    access: req.access,
  });
});

router.get("/:roomId", (req, res) => {
  const { roomId } = req.params;
  const exists = rooms.has(roomId);
  res.json({ exists });
});

export default router;
