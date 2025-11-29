import React, { useEffect, useState, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { socket } from "../../socket/socket";
import { Session, Local } from "../../utils/storage";
import { useAuth } from "../Contexts/AuthContext";

function RoomChat() {
  const { user } = useAuth();
  const username = user?.username || "Anonymous";

  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const stored = Local.get("roomId"); 
    if (stored) setRoomId(stored);
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const saved = Session.get(`messages-${roomId}`); 

    if (saved && saved.length > 0) {
      setMessages(saved);
    }
  }, [roomId]);

  const [onlineCount, setOnlineCount] = useState(0);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!roomId) return;
    if (messages.length === 0) return;
 
    Session.set(`messages-${roomId}`, messages);
  }, [messages, roomId]);

  useEffect(() => {
    if (!roomId) return;
 
    socket.emit("joinRoom", roomId);

    const handleChatHistory = (history) => { 

      const saved = Session.get(`messages-${roomId}`);

      if (!saved || saved.length === 0) { 
        setMessages((prev) => {
          const uniqueMessages = history.filter(
            (msg) => !prev.some((p) => p.timestamp === msg.timestamp && p.text === msg.text)
          );
          const updatedMessages = [...prev, ...uniqueMessages];
          Session.set(`messages-${roomId}`, updatedMessages); 
          return updatedMessages;
        });
      } else { 
        setMessages(saved);
      }

      scrollToBottom();
    };

    const handleReceiveMessage = (msg) => { 

      setMessages((prev) => {
        if (prev.some((p) => p.timestamp === msg.timestamp && p.text === msg.text)) {
          return prev; 
        }
        const updatedMessages = [...prev, msg];
        Session.set(`messages-${roomId}`, updatedMessages);  
        return updatedMessages;
      });
      scrollToBottom();
    };

    const handleRoomMembers = (count) => { 
      setOnlineCount(count);
    };

    socket.on("chatHistory", handleChatHistory);
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("roomMembers", handleRoomMembers);

    return () => {
      socket.off("chatHistory", handleChatHistory);
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("roomMembers", handleRoomMembers);
    };
  }, [roomId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) { 
      return;
    } 

    setSending(true);

    const message = {
      roomId,
      sender: username,
      text: input.trim(),
      timestamp: Date.now(),
    }; 
    setMessages((prev) => {
      const updatedMessages = [...prev, message];
      Session.set(`messages-${roomId}`, updatedMessages);
      return updatedMessages;
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

  return (
    <div
      className="relative h-[91vh] flex flex-col justify-between text-white rounded-lg"
      style={{
        backgroundColor: "#111827",
        border: "1px solid #374151",
        overflow: "hidden",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          backgroundColor: "#1f2937",
          borderBottom: "1px solid #374151",
        }}
      >
        <h2 className="text-lg font-semibold text-white">💬 Room Chat</h2>
        <p className="text-green-500 text-sm whitespace-nowrap">
          👥Online: {onlineCount}
        </p>
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#4b5563 #1f2937",
        }}
      >
        {messages.length > 0 ? (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`w-full flex ${
                msg.sender === username ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-2xl py-1 px-4 min-w-[150px] text-sm shadow-md transition-all duration-300 ${
                  msg.sender === username
                    ? "bg-blue-700 text-white"
                    : "bg-gray-800 text-gray-100"
                }`}
                style={{
                  border:
                    msg.sender === username
                      ? "1px solid #3b82f6"
                      : "1px solid #374151",
                }}
              >
                <div className="font-semibold text-xs opacity-80">
                  {msg.sender}
                </div>
                <p className="whitespace-pre-wrap leading-relaxed font-md text-lg">
                  {msg.text}
                </p> 
                <div className="text-[10px] text-gray-400 mt-1 text-right">
                  {msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : ""}
                </div> 
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center mt-10 italic">
            No messages yet. Start the conversation! 💬
          </p>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="p-3 flex gap-2 sticky bottom-0"
        style={{
          backgroundColor: "#1f2937",
          borderTop: "1px solid #374151",
        }}
      >
        <textarea
          value={input}
          ref={inputRef}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 outline-none text-white rounded-md px-3 py-3 resize-none overflow-hidden text-base"
          style={{
            backgroundColor: "#374151",
            border: "1px solid #4b5563",
            minHeight: "36px",
          }}
        />
        <button
          type="submit"
          disabled={sending}
          className={`text-white px-5 py-2.5 rounded-md flex items-center justify-center gap-2 shadow-md transition-all duration-200 ${
            sending ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
          style={{
            backgroundColor: "#2563eb",
          }}
        >
          {sending ? <Loader2 className="animate-spin h-5 w-5" /> : <Send size={18} />}
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default RoomChat;
