import { Server } from "socket.io";
import { rooms } from "./room.js"; 

export default function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinRoom", (roomId) => {
      if (!roomId) return;
 
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { code: "", language: "java" });
        console.log(`Auto-created room: ${roomId}`);
      }

      socket.join(roomId);
      const { code, language } = rooms.get(roomId);
      console.log(`[Server] ${socket.id} joined room ${roomId}`);

      socket.emit("roomJoined", { roomId });
      socket.emit("updatedCode", { roomId, code, senderId: "server" });
      socket.emit("languageChange", { roomId, language });
    });

    socket.on("languageChange", ({ roomId, selectedLanguage }) => {
      if (!rooms.has(roomId)) return;
      rooms.get(roomId).language = selectedLanguage;
      io.to(roomId).emit("languageChange", {
        roomId,
        language: selectedLanguage,
      });
    });

    socket.on("updatedCode", ({ roomId, code, senderId }) => {
      if (!rooms.has(roomId)) return;
      rooms.get(roomId).code = code;
      socket.to(roomId).emit("updatedCode", { roomId, code, senderId });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}
