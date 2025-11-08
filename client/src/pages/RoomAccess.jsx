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
  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const suppressAutoNavigateRef = useRef(false);

  // ✅ Authentication check runs first
  useEffect(() => {
    const checkAuth = async () => {
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

  // ✅ Show loader while checking auth
  if (isChecking) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f0a19] text-white text-xl">
        Checking authentication...
      </div>
    );
  }

  // ✅ Show welcome popup once authenticated
  useEffect(() => {
    if (user) {
      MySwal.fire({
        title: <p className="text-xl font-semibold text-green-400">Welcome Back!</p>,
        html: `<p style="font-size:16px;">Hello, ${user.username}!</p>`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#1e1e2e",
        color: "#fff"
      });
    }
  }, [user]);

  useEffect(() => {
    socket.on("roomJoined", ({ roomId }) => {
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
      socket.off("roomJoined");
      socket.off("roomCreated");
      socket.off("error");
    };
  }, [navigate]);

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      return MySwal.fire({
        iconHtml: <FiAlertTriangle size={50} className="text-yellow-500" />,
        title: "Missing Room ID",
        text: "Please enter a Room ID first.",
        confirmButtonColor: "#16A34A",
      });
    }

    try {
      const response = await axios.get(`${API_URL}/room/${roomId}`, { withCredentials: true });

      if (!response.data.exists) {
        return MySwal.fire({
          iconHtml: <FiAlertTriangle size={50} className="text-red-500" />,
          title: "Room Not Found",
          confirmButtonColor: "#EF4444",
        });
      }

      Swal.fire({
        title: "Joining...",
        showConfirmButton: false,
        background: "#1e1e2e",
        color: "#fff"
      });

      if (socket.connected) socket.emit("joinRoom", roomId);
      else socket.connect(() => socket.emit("joinRoom", roomId));

    } catch {
      MySwal.fire({
        iconHtml: <FiAlertTriangle size={50} className="text-red-500" />,
        title: "Connection Error",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    socket.emit("joinRoom", newRoomId);
    navigate(`/CodeScribe/${newRoomId}`);
  };

  const handleLogout = async () => {
    await axios.put(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    localStorage.removeItem("user");
    navigate("/register");
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      
      {user && (
        <button
          className="absolute top-4 right-4 bg-red-500 px-5 py-2 rounded-lg text-white font-bold hover:bg-red-600 transition-all duration-300 flex items-center gap-2"
          onClick={handleLogout}
        >
          <FiLogOut size={20} /> Logout
        </button>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="flex flex-col py-32 items-center gap-6 bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-xl"
      >
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600">
          Code Together, Instantly!
        </h1>

        <div className="flex gap-6">
          <button onClick={handleCreateRoom} className="px-6 py-3 bg-blue-700 rounded-xl hover:bg-blue-600">
            Create Room
          </button>
          <button onClick={handleJoinRoom} className="px-6 py-3 bg-green-700 rounded-xl hover:bg-green-600">
            Join Room
          </button>
        </div>

        <input
          type="text"
          placeholder="Enter Room Code..."
          className="text-center px-4 py-3 w-full rounded-md bg-transparent border border-gray-600"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
      </motion.div>
    </div>
  );
}

export default RoomAccess;
