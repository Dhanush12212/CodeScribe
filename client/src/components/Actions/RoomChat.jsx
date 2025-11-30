import React, { useEffect, useState, useRef, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { socket } from "../../socket/socket";
import { Session, Local } from "../../utils/storage";
import { useAuth } from "../Contexts/AuthContext";

function RoomChat() {
  const { user } = useAuth();
  const username = user?.username || "Anonymous";

  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const hasJoinedRef = useRef(false);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const storedRoom = Local.get("roomId");
    if (storedRoom) setRoomId(storedRoom);
  }, []);

  useEffect(() => {
    if (!roomId) return;
    const saved = Session.get(`messages-${roomId}`);
    if (saved && saved.length) setMessages(saved);
  }, [roomId]);

  const handleChatHistory = useCallback(
    (serverHistory) => {
      const saved = Session.get(`messages-${roomId}`) || [];
      const merged = [...serverHistory, ...saved];
      setMessages(merged);
      Session.set(`messages-${roomId}`, merged);
      scrollToBottom();
    },
    [roomId]
  );

  const handleReceiveMessage = useCallback(
    (msg) => {
      setMessages((prev) => {
        const updated = [...prev, msg];
        Session.set(`messages-${roomId}`, updated);
        return updated;
      });
      scrollToBottom();
    },
    [roomId]
  );

  const handleRoomMembers = useCallback((count) => setOnlineCount(count), []);

  useEffect(() => {
    if (!roomId || hasJoinedRef.current) return;
    hasJoinedRef.current = true;
    socket.emit("joinRoom", roomId);
    socket.on("chatHistory", handleChatHistory);
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("roomMembers", handleRoomMembers);

    return () => {
      socket.off("chatHistory", handleChatHistory);
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("roomMembers", handleRoomMembers);
      hasJoinedRef.current = false;
    };
  }, [roomId, handleChatHistory, handleReceiveMessage, handleRoomMembers]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);

    const message = {
      roomId,
      sender: username,
      text: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => {
      const updated = [...prev, message];
      Session.set(`messages-${roomId}`, updated);
      return updated;
    });

    socket.emit("sendMessage", message);
    setInput("");
    setTimeout(() => setSending(false), 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "36px";
      inputRef.current.style.height = inputRef.current.scrollHeight + "px";
    }
  }, [input]);

  useEffect(() => inputRef.current?.focus(), []);

  useEffect(() => {
    if (inputRef.current) {
      const el = inputRef.current;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, []);

  return (
    <div
      className="relative h-[91vh] flex flex-col justify-between text-white rounded-lg text-xs sm:text-sm"
      style={{ backgroundColor: "#111827", border: "1px solid #374151", overflow: "hidden" }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: "#1f2937", borderBottom: "1px solid #374151" }}
      >
        <h2 className="text-base sm:text-lg font-semibold">💬 Room Chat</h2>
        <p className="text-green-500 text-xs sm:text-sm">👥Online: {onlineCount}</p>
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
        {messages.length > 0 ? (
          messages.map((msg, idx) => (
            <div key={idx} className={`w-full flex ${msg.sender === username ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-2xl py-1 px-3 sm:px-4 min-w-[120px] sm:min-w-[150px] shadow-md text-xs sm:text-sm ${
                  msg.sender === username ? "bg-blue-700 text-white" : "bg-gray-800 text-gray-100"
                }`}
              >
                <div className="font-semibold text-[10px] sm:text-xs opacity-80">{msg.sender}</div>
                <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-lg">{msg.text}</p>
                <div className="text-[8px] sm:text-[10px] text-gray-400 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center mt-10 italic text-xs sm:text-sm">
            No messages yet. Start the conversation! 💬
          </p>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="p-3 flex gap-2 sticky bottom-0"
        style={{ backgroundColor: "#1f2937", borderTop: "1px solid #374151" }}
      >
        <textarea
          value={input}
          ref={inputRef}
          onChange={(e) => {
            setInput(e.target.value);
            const el = e.target;
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 outline-none text-white rounded-md px-3 py-3 resize-none overflow-hidden text-sm sm:text-base"
          style={{
            backgroundColor: "#374151",
            border: "1px solid #4b5563",
            minHeight: "36px",
            maxHeight: "150px",
          }}
        />
        <button
          type="submit"
          disabled={sending}
          className="text-white px-4 sm:px-5 py-2.5 rounded-md flex items-center justify-center gap-2 text-sm sm:text-base"
          style={{ backgroundColor: "#2563eb" }}
        >
          {sending ? <Loader2 className="animate-spin" /> : <Send size={16} className="sm:w-[18px] sm:h-[18px]" />}
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default RoomChat;
