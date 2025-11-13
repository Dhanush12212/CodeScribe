import { Server } from "socket.io";
import { rooms, roomMessages } from "./room.js"; 

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
        // console.log(`Auto-created room: ${roomId}`);
      }

      socket.join(roomId);
      const { code, language } = rooms.get(roomId);
      // console.log(`[Server] ${socket.id} joined room ${roomId}`);

      const totalUsers = io.sockets.adapter.rooms.get(roomId)?.size || 0; 
      io.to(roomId).emit("roomMembers", totalUsers);
      
      socket.emit("roomJoined", { roomId });
      socket.emit("updatedCode", { roomId, code, senderId: "server" });
      socket.emit("languageChange", { roomId, language });

      //Send Chat History when user joined
      const chatHistory = roomMessages.get(roomId) || [];
      socket.emit("chatHistory", chatHistory);
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

    //Handle send Message
    socket.on("sendMessage", ({ roomId, sender, text}) => {
      if( !roomId || !text) return;

      //Create message entry if none
      if(!roomMessages.has(roomId)) {
        roomMessages.set(roomId, []);
      }

      const message = {
        sender,
        text,
        timestamp: new Date(),
      };
      console.log("Received Message", message.text);

      //Save to memory
      roomMessages.get(roomId).push(message);
      
      //BroadCast to all in room
      io.to(roomId).emit('receiveMessage', message); 
    });


    //Clean Chats when user disconnects 
    socket.on("disconnecting", () => {
      socket.rooms.forEach((roomId) => {
        if (roomId !== socket.id) {
          const room = io.sockets.adapter.rooms.get(roomId);

          // Calculate remaining users
          const totalUsers = room ? room.size - 1 : 0;
         
          io.to(roomId).emit("roomMembers", totalUsers);

          // Cleanup chat history if room is empty
          if (totalUsers <= 0) {
            console.log(`Room ${roomId} is empty. Deleting chats...`);
            roomMessages.delete(roomId);
          }
        }
      });
    });


    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}
