import { Server } from "socket.io";
import { rooms, roomMessages } from "./room.js";
import { getBaseUrl } from "../utils/env.js";   

export default function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [getBaseUrl()],            
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinRoom", (roomId) => { 
      if (!roomId) return;

      if (!rooms.has(roomId)) {  
        socket.emit("error", { message: "Room does not exist" });
        return;
      }
 
      socket.join(roomId);
      const { code, language } = rooms.get(roomId);

      const totalUsers = io.sockets.adapter.rooms.get(roomId)?.size || 0; 
      console.log(`User ${socket.id} joined room: ${roomId}`);
      console.log(`Total users in room ${roomId}:`, totalUsers);
      console.log(`Emitting roomMembers event for room ${roomId}:`, totalUsers);
      io.to(roomId).emit("roomMembers", totalUsers);

      socket.emit("roomJoined", { roomId });
      socket.emit("updatedCode", { roomId, code, senderId: "server" });
      socket.emit("languageChange", { roomId, language });
 
      const chatHistory = roomMessages.get(roomId) || [];
  
      console.log(`Sending chat history for room ${roomId}:`, chatHistory);
      socket.emit("chatHistory", chatHistory);
    });

    socket.on("languageChange", ({ roomId, language }) => {
      if (!rooms.has(roomId)) return;

      rooms.get(roomId).language = language;

      io.to(roomId).emit("languageChange", {
        roomId,
        language,
      });
    });

    socket.on("updatedCode", ({ roomId, code, senderId }) => {
      if (!rooms.has(roomId)) return;
      rooms.get(roomId).code = code;
      socket.to(roomId).emit("updatedCode", { roomId, code, senderId });
    });

    socket.on("sendMessage", ({ roomId, sender, text }) => {
      if (!roomId || !text) return;

      if (!roomMessages.has(roomId)) {
        roomMessages.set(roomId, []);
      }

      const message = {
        sender,
        text,
        timestamp: new Date(),
      }; 

      roomMessages.get(roomId).push(message);

      console.log(`Message received for room ${roomId}:`, message);
      console.log(`Updated chat history for room ${roomId}:`, roomMessages.get(roomId));
      io.to(roomId).emit("receiveMessage", message);
    });

    socket.on("createRoom", ({ roomId, code, language }) => { 
      if (rooms.has(roomId)) { 
        socket.emit("error", { message: "Room already exists" });
        return;
      }

      rooms.set(roomId, { code: code || "", language: language || "javascript" });
      roomMessages.set(roomId, []);
 
      socket.emit("roomCreated", { roomId });
    });

    socket.on("disconnecting", () => {
      socket.rooms.forEach((roomId) => {
        if (roomId !== socket.id) {
          const room = io.sockets.adapter.rooms.get(roomId);
          const totalUsers = room ? room.size - 1 : 0;

          console.log(`User ${socket.id} leaving room: ${roomId}`);
          console.log(`Updated total users in room ${roomId}:`, totalUsers);
          io.to(roomId).emit("roomMembers", totalUsers);
        }
      });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}
