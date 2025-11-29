export const rooms = new Map();       
export const roomMessages = new Map();  

export function createRoom(roomId, ownerId) {
  rooms.set(roomId, {
    owner: ownerId,
    code: "",
    language: "java",
    createdAt: Date.now(),
  });
}
