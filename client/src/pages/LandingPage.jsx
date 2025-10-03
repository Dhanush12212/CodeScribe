import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config.js';
import { useNavigate, Link } from 'react-router-dom';
import { socket } from '../socket/socket.js';

function LandingPage() {
  const [roomId, setRoomId] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [joinedRoom, setJoinedRoom] = useState("");

  const navigate = useNavigate();

  useEffect(() => { 
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/Auth/loginStatus`, { withCredentials: true });
        setIsLogin(response.data.isAuthenticated);
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    socket.on('connect', () => {
      console.log(`Connected: ${socket.id}`);
    }); 

    socket.on('roomJoined', ({ roomId, message }) => {
      console.log(message);
      setJoinedRoom(roomId);
      navigate(`/CodeMesh/${roomId}`);
    });

    socket.on('error', (error) => {
      alert(error.message);  
    });

    return () => {
      socket.off('connect');
      socket.off('roomJoined');
      socket.off('error');
    };
  }, [navigate]);

  const handleJoinRoom = () => { 
    if (!roomId.trim()) {
      alert("Please enter a valid Room ID.");
      return;
    }
    console.log("Joining room:", roomId); 
    socket.emit('joinRoom', roomId);
  }; 

  const handleCreateRoom = () => {
    if (!roomId.trim()) {
      alert("Please enter a Room ID to create.");
      return;
    }
    
    socket.emit('joinRoom', roomId); 
  };
  

  const handleLogout = async () => {
    try {
      await axios.put(`${API_URL}/Auth/logout`, {}, { withCredentials: true });
      console.log("Logout Successfully");
      setIsLogin(false);
      navigate('/login');
    } catch (error) {
      console.error("Logout Error: ", error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-6 sm:px-0 relative">
      {isLogin ? (
        <button
          className="absolute top-4 right-4 bg-red-500 px-5 py-2 rounded-lg text-white font-bold shadow-lg hover:bg-red-600 transition-all duration-300"
          onClick={handleLogout}
        >
          Logout
        </button>
      ) : (
        <Link to='/register'>
          <button 
            className="absolute top-4 right-4 bg-zinc-600 px-8 py-3 rounded-lg text-white font-bold shadow-lg hover:bg-zinc-500 hover:text-black transition-all duration-300"
          >
            Sign In
          </button>
        </Link>
      )}

      {/* Container */}
      <div className="absolute flex flex-col py-20 sm:py-40 items-center text-center gap-8 bg-white/10 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-xl border border-white/20">
        <div className="flex flex-col gap-4 text-white">
          <h1 className="Text lg:text-5xl md:text-5xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800 drop-shadow-lg text-center tracking-tight">
            Code Together, Anywhere, Anytime!
          </h1>
          <p className="desc sm:text-2xl font-medium sm:font-semibold text-gray-200 opacity-90 drop-shadow-md text-center leading-relaxed">
            Collaborate in real-time with <span className="text-blue-400">seamless coding</span> & <span className="text-purple-400">instant updates</span>.
          </p>
        </div>

        <div className="flex gap-6">
          <button 
            className="Button px-6 sm:px-8 py-3 sm:py-4 text-lg font-semibold text-white bg-blue-700 rounded-xl shadow-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 transition-all duration-300 cursor-pointer"
            onClick={handleCreateRoom}
          >
            Create Room
          </button>
          <button 
            className="Button px-6 sm:px-8 py-3 sm:py-4 text-lg font-semibold text-white bg-green-700 rounded-xl shadow-md hover:bg-green-600 focus:ring-2 focus:ring-green-300 transition-all duration-300 cursor-pointer"
            onClick={handleJoinRoom}
          >
            Join Room
          </button>
        </div> 

        <div className="flex mt-3 items-center gap-4">
          <input 
            type="text" 
            name='code'
            placeholder="Enter Room Code"
            className='border-b outline-none text-white text-center px-4 py-2 lg:text-xl md:text-lg w-full rounded-md shadow-md focus:ring-2 focus:ring-green-600'
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)} 
          />
        </div> 
      </div>
    </div>
  );
}

export default LandingPage;
