import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_URL } from "../../config.js";
import { useNavigate, Link } from "react-router-dom";
import { socket } from "../socket/socket.js";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { FiLogIn, FiLogOut, FiAlertTriangle } from "react-icons/fi";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";

const MySwal = withReactContent(Swal);

function RoomAccess() {
  const [roomId, setRoomId] = useState("");
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const suppressAutoNavigateRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      MySwal.fire({
        title: <p className="text-xl font-semibold text-green-400">Welcome Back!</p>,
        html: `<p style="font-size:16px;">Hello, ${user.name || "User"}!</p>`,
        iconHtml: `<svg xmlns="http://www.w3.org/2000/svg" class="text-green-500 mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>`,
        showConfirmButton: false,
        timer: 1800,
        width: "380px",
        background: "#1e1e2e",
        color: "#fff",
        padding: "1.5rem",
        timerProgressBar: true,
      });
    }
  }, []);

  useEffect(() => {
    socket.on("connect", () => console.log(`Connected: ${socket.id}`));
    socket.on("roomJoined", ({ roomId }) => {
      if (suppressAutoNavigateRef.current) return;
      Swal.close();
      navigate(`/CodeScribe/${roomId}`);
    });
    socket.on("roomCreated", ({ roomId }) => {
      Swal.close();
      navigate(`/CodeScribe/${roomId}`);
    });
    socket.on("error", (error) => {
      Swal.close();
      MySwal.fire({
        iconHtml: <FiAlertTriangle size={50} className="text-red-500" />,
        title: "Error!",
        text: error.message || "Something went wrong!",
        confirmButtonColor: "#EF4444",
      });
    });
    return () => {
      socket.off("connect");
      socket.off("roomJoined");
      socket.off("roomCreated");
      socket.off("error");
    };
  }, [navigate]);

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      MySwal.fire({
        iconHtml: <FiAlertTriangle size={50} className="text-yellow-500" />,
        title: "Missing Room ID",
        text: "Please enter a valid Room ID before joining!",
        confirmButtonColor: "#16A34A",
      });
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/room/${roomId}`);
      if (!response.data.exists) {
        MySwal.fire({
          iconHtml: <FiAlertTriangle size={50} className="text-red-500" />,
          title: "Room Not Found",
          text: "This room ID does not exist. Please create a new one or check your code.",
          confirmButtonColor: "#EF4444",
        });
        return;
      }
      MySwal.fire({
        title: <p className="text-xl font-semibold text-green-400">Joining Room...</p>,
        html: `<div class="flex flex-col items-center justify-center gap-3">
                <svg class="animate-spin h-10 w-10 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path>
                </svg>
                <p class="text-gray-300">Please wait while we connect you...</p>
              </div>`,
        showConfirmButton: false,
        allowOutsideClick: false,
        background: "#1e1e2e",
        color: "#fff",
        width: "360px",
        padding: "1.5rem",
      });
      setTimeout(() => {
        if (socket.connected) {
          socket.emit("joinRoom", roomId);
        } else {
          socket.connect();
          socket.once("connect", () => socket.emit("joinRoom", roomId));
        }
      }, 1000);
    } catch (error) {
      console.error("Error checking room:", error);
      MySwal.fire({
        iconHtml: <FiAlertTriangle size={50} className="text-red-500" />,
        title: "Connection Error",
        text: "Unable to verify room existence. Please try again later.",
        confirmButtonColor: "#EF4444",
      });
    }
  };
const handleCreateRoom = () => {
  if (roomId.trim()) {
    MySwal.fire({
      iconHtml: <FiAlertTriangle size={50} className="text-yellow-500" />,
      title: "Cannot Create Room",
      text: "Please clear the Room ID field before creating a new room!",
      confirmButtonColor: "#3B82F6",
    });
    return;
  }

  const newRoomId = Math.random().toString(36).substring(2, 8);

  MySwal.fire({
    title: <p className="text-xl font-semibold text-blue-400">Creating Room...</p>,
    html: `<div class="flex flex-col items-center justify-center gap-3">
            <svg class="animate-spin h-10 w-10 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path>
            </svg>
            <p class="text-gray-300">Setting up your room...</p>
          </div>`,
    showConfirmButton: false,
    allowOutsideClick: false,
    background: "#1e1e2e",
    color: "#fff",
    width: "360px",
    padding: "1.5rem",
  });

  setTimeout(() => {
    suppressAutoNavigateRef.current = true;

    if (socket.connected) {
      socket.emit("joinRoom", newRoomId);
    } else {
      socket.connect();
      socket.once("connect", () => socket.emit("joinRoom", newRoomId));
    }

    MySwal.fire({
      title: <p className="text-2xl font-bold text-blue-400">Room Created!</p>,
      html: `
        <div class="flex flex-col items-center justify-center gap-4 text-white">
          <p>Your room ID:</p>
          <p id="roomCode" class="text-3xl font-mono bg-gray-800 px-4 py-2 rounded-lg" style="border: 1px solid #3B82F6;">${newRoomId}</p>
          <button id="copyBtn" class="mt-3 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-semibold">
            Copy Room ID
          </button>
          <p id="copiedMsg" class="text-green-400 mt-2 hidden">Copied to clipboard</p>
          <p class="text-gray-400 mt-3 text-sm">(Click outside to enter the room)</p>
        </div>
      `,
      showConfirmButton: false,
      allowOutsideClick: true, 
      background: "#1e1e2e",
      color: "#fff",
      width: "380px",
      padding: "1.5rem",
      didOpen: () => {
        const copyBtn = document.getElementById("copyBtn");
        const copiedMsg = document.getElementById("copiedMsg");

        copyBtn.addEventListener("click", () => {
          navigator.clipboard.writeText(newRoomId).then(() => {
            copiedMsg.classList.remove("hidden");
            copyBtn.textContent = "Copied!";
            copyBtn.disabled = true;

            setTimeout(() => {
              Swal.close();
              suppressAutoNavigateRef.current = false;
              navigate(`/CodeScribe/${newRoomId}`);
            }, 100);
          });
        });
      },
      didClose: () => {
        suppressAutoNavigateRef.current = false;
        navigate(`/CodeScribe/${newRoomId}`);
      },
    });
  }, 1000);
};


  const handleLogout = async () => {
    try {
      await axios.put(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem("user");
      setUser(null);
      MySwal.fire({
        title: <p>Logged Out</p>,
        html: `<p style="font-size:16px;">You have successfully logged out!</p>`,
        iconHtml: <FiLogOut size={50} className="text-red-500" />,
        showConfirmButton: false,
        timer: 1800,
        width: "350px",
        padding: "1.5rem",
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <div className="absolute inset-0 z-0 select-none">
        {[
          { name: "JAVA", color: "text-orange-400", top: "10%", left: "5%" },
          { name: "React", color: "text-cyan-400", top: "35%", left: "50%" },
          { name: "Python", color: "text-green-400", top: "65%", left: "70%" },
          { name: "JavaScript", color: "text-yellow-400", top: "50%", left: "10%" },
          { name: "C++", color: "text-blue-300", top: "80%", left: "40%" },
          { name: "Node.js", color: "text-lime-400", top: "15%", left: "60%" },
        ].map((lang, i) => (
          <p
            key={i}
            className={`absolute ${lang.color} opacity-20 text-5xl font-bold animate-float-slow`}
            style={{ top: lang.top, left: lang.left }}
          >
            {lang.name}
          </p>
        ))}
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 sm:px-0">
        {user ? (
          <button
            className="absolute top-4 right-4 bg-red-500 px-5 py-2 rounded-lg text-white font-bold shadow-lg hover:bg-red-600 transition-all duration-300 flex items-center gap-2"
            onClick={handleLogout}
          >
            <FiLogOut size={20} /> Logout
          </button>
        ) : (
          <Link to="/register">
            <button className="absolute top-4 right-4 bg-zinc-700 px-8 py-3 rounded-lg text-white font-bold shadow-lg hover:bg-zinc-500 hover:text-black transition-all duration-300 flex items-center gap-2">
              <FiLogIn size={20} /> Sign In
            </button>
          </Link>
        )}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col py-20 sm:py-40 items-center text-center gap-8 bg-white/10 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-xl"
          style={{ border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <div className="flex flex-col gap-4 text-white">
            <h1 className="lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600 drop-shadow-lg text-center tracking-tight">
              Code Together, Anywhere, Anytime!
            </h1>
            <p className="sm:text-2xl font-medium text-gray-200 opacity-90 drop-shadow-md text-center leading-relaxed">
              <Typewriter
                words={[
                  "Collaborate in real-time",
                  "Write, Compile, and Share instantly",
                  "Experience seamless teamwork",
                ]}
                loop={0}
                cursor
                cursorStyle="_"
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={1500}
              />
            </p>
          </div>
          <div className="flex gap-6">
            <button
              className="px-8 py-4 text-lg font-semibold text-white bg-blue-700 rounded-xl shadow-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 transition-all duration-300"
              onClick={handleCreateRoom}
            >
              Create Room
            </button>
            <button
              className="px-8 py-4 text-lg font-semibold text-white bg-green-700 rounded-xl shadow-md hover:bg-green-600 focus:ring-2 focus:ring-green-300 transition-all duration-300"
              onClick={handleJoinRoom}
            >
              Join Room
            </button>
          </div>
          <div className="flex mt-3 items-center gap-4">
            <input
              type="text"
              placeholder="Enter Room Code..."
              className="outline-none text-white text-center px-4 py-3 lg:text-xl md:text-lg w-full rounded-md shadow-md focus:ring-2 focus:ring-green-600 bg-transparent placeholder-gray-400"
              style={{ border: "1px solid rgba(255, 255, 255, 0.2)" }}
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default RoomAccess;
