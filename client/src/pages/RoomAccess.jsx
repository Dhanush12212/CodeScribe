import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_URL } from "../../config.js";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket/socket.js";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { FiLogOut, FiAlertTriangle } from "react-icons/fi";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { assets } from "../assets/assets.js";
import { useAuth } from "../components/Contexts/AuthContext.jsx";
import { Local, Session } from "../utils/storage.js";

const MySwal = withReactContent(Swal);

function RoomAccess() {
  const [roomId, setRoomId] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { user, setUser } = useAuth();

  const suppressAutoNavigateRef = useRef(false);
  const hasWelcomedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      setIsChecking(true);
      try {
        const res = await axios.get(`${API_URL}/auth/isLoggedIn`, { withCredentials: true });
        setUser(res.data.user);
      } catch {
        navigate("/register");
      } finally {
        setIsChecking(false);
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (user && !hasWelcomedRef.current) {
      const alreadyWelcomed = Local.get("welcome-shown");
      if (alreadyWelcomed) return;
      Local.set("welcome-shown", true);
      hasWelcomedRef.current = true;

      MySwal.fire({
        title: <p className="text-xl font-semibold text-green-400">Welcome Back!</p>,
        html: `<p style="font-size:16px;">Hello, ${
          user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "User"
        }!</p>`,
        iconHtml: `<svg xmlns="http://www.w3.org/2000/svg" class="text-green-500 mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>`,
        showConfirmButton: false,
        timer: 1800,
        width: "380px",
        background: "#2e2e2e",
        color: "#fff",
        padding: "1.5rem",
        timerProgressBar: true,
      });
    }
  }, [user]);

  useEffect(() => {
    socket.on("connect", () => console.log(`Connected: ${socket.id}`));

    socket.on("roomJoined", ({ roomId }) => {
      if (suppressAutoNavigateRef.current) return;
    
      setTimeout(() => {
        Swal.close();
        navigate(`/CodeScribe/${roomId}`);
      }, 1000);
    }); 

    socket.on("roomCreated", ({ roomId }) => {
      setTimeout(() => {
        Swal.close();
        navigate(`/CodeScribe/${roomId}`);
      }, 1000);
    }); 

    socket.on("error", (error) => {
      Swal.close();
      MySwal.fire({
        iconHtml: <FiAlertTriangle size={50} className="text-red-500" />,
        title: "Error!",
        text: error.message || "Something went wrong!",
        confirmButtonColor: "#EF4444",
        background: "#2e2e2e",
        color: "#fff",
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
        background: "#2e2e2e",
        color: "#fff",
      });
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/room/${roomId}`);

      if (!response.data.exists) {
        MySwal.fire({
          iconHtml: <FiAlertTriangle size={50} className="text-red-500" />,
          title: "Room Not Found",
          text: "This room ID does not exist.",
          confirmButtonColor: "#EF4444",
          background: "#2e2e2e",
          color: "#fff",
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
        background: "#2e2e2e",
        color: "#fff",
        width: "360px",
        padding: "1.5rem"
      });

      setTimeout(() => {
        if (socket.connected) {
          socket.emit("joinRoom", roomId);
        } else {
          socket.connect();
          socket.once("connect", () => socket.emit("joinRoom", roomId));
        }
      }, 1000);
    } catch {
      MySwal.fire({
        iconHtml: <FiAlertTriangle size={50} className="text-red-500" />,
        title: "Connection Error",
        text: "Unable to verify room.",
        confirmButtonColor: "#EF4444",
        background: "#2e2e2e",
        color: "#fff",
      });
    }
  };

  const handleCreateRoom = () => {
    if (roomId.trim()) {
      MySwal.fire({
        iconHtml: <FiAlertTriangle size={50} className="text-yellow-500" />,
        title: "Cannot Create Room",
        text: "Clear Room ID field before creating a new room!",
        confirmButtonColor: "#3B82F6",
        background: "#2e2e2e",
        color: "#fff",
      });
      return;
    }

    const newRoomId = Math.random().toString(36).substring(2, 8);
    Local.set("roomId", newRoomId);
    Session.set("roomId", newRoomId);
    suppressAutoNavigateRef.current = false;

    MySwal.fire({
      title: <p className="text-xl font-semibold text-blue-400">Creating Room...</p>,
      html: `<div class="flex flex-col items-center justify-center gap-3">
              <svg class="animate-spin h-10 w-10 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path>
              </svg>
              <p class="text-gray-300">Setting things up...</p>
            </div>`,
      showConfirmButton: false,
      allowOutsideClick: false,
      background: "#2e2e2e",
      color: "#fff",
      width: "360px",
      padding: "1.5rem"
    });

    setTimeout(() => {
      if (socket.connected) {
        socket.emit("joinRoom", newRoomId);
      } else {
        socket.connect();
        socket.once("connect", () => socket.emit("joinRoom", newRoomId));
      }
    }, 1000);
  };

  const handleLogout = async () => {
    try {
      await axios.put(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      Local.remove("user");
      setUser(null);
      navigate("/register");

      MySwal.fire({
        title: <p>Logged Out</p>,
        html: `<p style="font-size:16px;">You have successfully logged out!</p>`,
        iconHtml: <FiLogOut size={50} className="text-red-500" />,
        showConfirmButton: false,
        timer: 1800,
        width: "350px",
        padding: "1.5rem",
        timerProgressBar: true,
        background: "#2e2e2e",
        color: "#fff",
      });
    } catch {}
  };

  if (isChecking) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f0a19] text-white text-xl">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <div className="absolute inset-0 z-0 select-none">
        {[
          { name: "JAVA", color: "text-orange-400", top: "10%", left: "5%" },
          { name: "React", color: "text-cyan-400", top: "30%", left: "90%" },
          { name: "Python", color: "text-green-400", top: "65%", left: "80%" },
          { name: "JavaScript", color: "text-yellow-400", top: "50%", left: "10%" },
          { name: "C++", color: "text-blue-300", top: "90%", left: "40%" },
          { name: "Node.js", color: "text-lime-400", top: "10%", left: "60%" },
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
        {user && (
          <div className="absolute top-4 right-4 select-none">
            <div className="relative">
              <img
                src={assets.Profile}
                alt="Profile"
                onClick={() => setShowMenu((prev) => !prev)}
                className="bg-gray-400 w-12 h-12 rounded-full shadow-md cursor-pointer transition-all duration-300 hover:shadow-blue-500/40 hover:ring-2 hover:ring-blue-400 hover:scale-[1.06]"
                style={{ border: "1px solid rgba(255,255,255,0.25)" }}
              />

              {showMenu && (
                <div
                  className="absolute right-0 mt-3 w-56 rounded-xl bg-[#14151b]/95 backdrop-blur-lg shadow-2xl z-50 animate-dropdown flex items-center flex-col"
                  style={{ border: "1px solid rgba(255,255,255,0.20)" }}
                >
                  <div
                    className="px-4 py-4 flex items-center gap-3"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.18)" }}
                  >
                    <img
                      src={assets.Profile}
                      alt="User Avatar"
                      className="w-11 h-11 rounded-full shadow-sm bg-gray-400"
                      style={{ border: "1px solid rgba(255,255,255,0.25)" }}
                    />
                    <div className="leading-tight">
                      <p className="text-md font-semibold text-blue-400 truncate max-w-[140px]">
                        {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "User"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:underline hover:text-red-600 transition-all duration-200 text-center cursor-pointer"
                  >
                    <FiLogOut size={18} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
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
              className="px-8 py-4 text-lg font-semibold text-white bg-blue-700 cursor-pointer rounded-xl shadow-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 transition-all duration-300"
              onClick={handleCreateRoom}
            >
              Create Room
            </button>
            <button
              className="px-8 py-4 text-lg font-semibold text-white bg-green-700 rounded-xl cursor-pointer shadow-md hover:bg-green-600 focus:ring-2 focus:ring-green-300 transition-all duration-300"
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
