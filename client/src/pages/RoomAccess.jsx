import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config.js';
import { useNavigate, Link } from 'react-router-dom';
import { socket } from '../socket/socket.js';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { 
  FiLogIn, 
  FiLogOut, 
  FiInfo, 
  FiAlertTriangle
} from 'react-icons/fi';

const MySwal = withReactContent(Swal);

function RoomAccess() {
  const [roomId, setRoomId] = useState(""); 
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  }); 

  const navigate = useNavigate();  

  useEffect(() => {
    if (user) {
      MySwal.fire({
        title: <p className="text-xl font-semibold text-green-400">Welcome Back!</p>,
        html: `<p style="font-size:16px;">Hello, ${user.name || 'User'}!</p>`,
        iconHtml: `<svg xmlns="http://www.w3.org/2000/svg" class="text-green-500 mx-auto w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>`,
        showConfirmButton: false,
        timer: 1800,
        width: '380px',
        background: '#1e1e2e',
        color: '#fff',
        padding: '1.5rem',
        timerProgressBar: true,
      });
    }
  }, []);

  useEffect(() => {
    socket.on('connect', () => console.log(`Connected: ${socket.id}`));
    socket.on('roomJoined', ({ roomId, message }) => {
      Swal.close();
      navigate(`/CodeMesh/${roomId}`);
    });
    socket.on('error', (error) => {
      Swal.close();
      MySwal.fire({
        iconHtml: <FiAlertTriangle size={50} className="text-red-500"/>,
        title: 'Error!',
        text: error.message || 'Something went wrong!',
        confirmButtonColor: '#EF4444',
      });
    });

    return () => {
      socket.off('connect');
      socket.off('roomJoined');
      socket.off('error');
    };
  }, [navigate]);

  const handleJoinRoom = () => { 
    if (!roomId.trim()) {
      MySwal.fire({
        iconHtml: <FiAlertTriangle size={50} className="text-yellow-500"/>,
        title: 'Missing Room ID',
        text: 'Please enter a valid Room ID before joining!',
        confirmButtonColor: '#16A34A',
      });
      return;
    } 
  
    MySwal.fire({
      title: <p className="text-xl font-semibold text-green-400">Joining Room...</p>,
      html: `
        <div class="flex flex-col items-center justify-center gap-3">
          <svg class="animate-spin h-10 w-10 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path>
          </svg>
          <p class="text-gray-300">Please wait while we connect you...</p>
        </div>
      `,
      showConfirmButton: false,
      allowOutsideClick: false,
      background: '#1e1e2e',
      color: '#fff',
      width: '360px',
      padding: '1.5rem',
    });
  
    setTimeout(() => socket.emit('joinRoom', roomId), 1500);
  };
  
  const handleCreateRoom = () => {
    if (!roomId.trim()) {
      MySwal.fire({
        iconHtml: <FiInfo size={50} className="text-blue-500"/>,
        title: 'Room ID Required',
        text: 'Please enter a Room ID to create a new room.',
        confirmButtonColor: '#3B82F6',
      });
      return;
    }
  
    MySwal.fire({
      title: <p className="text-xl font-semibold text-blue-400">Creating Room...</p>,
      html: `
        <div class="flex flex-col items-center justify-center gap-3">
          <svg class="animate-spin h-10 w-10 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path>
          </svg>
          <p class="text-gray-300">Setting up your room, please wait...</p>
        </div>
      `,
      showConfirmButton: false,
      allowOutsideClick: false,
      background: '#1e1e2e',
      color: '#fff',
      width: '360px',
      padding: '1.5rem',
    });
  
    setTimeout(() => socket.emit('joinRoom', roomId), 1500);
  };

  const handleLogout = async () => {
    try {
      await axios.put(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem("user");
      setUser(null);
      MySwal.fire({
        title: <p>Logged Out</p>,
        html: `<p style="font-size:16px;">You have successfully logged out!</p>`,
        iconHtml: <FiLogOut size={50} className="text-red-500"/>,
        showConfirmButton: false,
        timer: 1800,
        width: '350px',
        padding: '1.5rem',
        timerProgressBar: true,
      });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-gray-900 text-white">
      
      {/* 🌟 Floating Coding Languages Background */}
      <div className="absolute inset-0 z-0 select-none">
        {[
          { name: "HTML", color: "text-orange-400", top: "10%", left: "5%" },
          { name: "CSS", color: "text-blue-400", top: "25%", left: "80%" },
          { name: "JavaScript", color: "text-yellow-400", top: "50%", left: "10%" },
          { name: "Python", color: "text-green-400", top: "65%", left: "70%" },
          { name: "C++", color: "text-blue-300", top: "80%", left: "40%" },
          { name: "React", color: "text-cyan-400", top: "35%", left: "50%" },
          { name: "Node.js", color: "text-lime-400", top: "15%", left: "60%" },
        ].map((lang, index) => (
          <p
            key={index}
            className={`absolute ${lang.color} opacity-20 text-5xl font-bold animate-float-slow`}
            style={{ top: lang.top, left: lang.left }}
          >
            {lang.name}
          </p>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 sm:px-0">
        {/* Auth Buttons */}
        {user ? (
          <button
            className="absolute top-4 right-4 bg-red-500 px-5 py-2 rounded-lg text-white font-bold shadow-lg hover:bg-red-600 transition-all duration-300 flex items-center gap-2"
            onClick={handleLogout}
          >
            <FiLogOut size={20}/> Logout
          </button>
        ) : (
          <Link to='/register'>
            <button 
              className="absolute top-4 right-4 bg-zinc-600 px-8 py-3 rounded-lg text-white font-bold shadow-lg hover:bg-zinc-500 hover:text-black transition-all duration-300 flex items-center gap-2"
            >
              <FiLogIn size={20}/> Sign In
            </button>
          </Link>
        )}

        {/* Main Card */}
        <div className="flex flex-col py-20 sm:py-40 items-center text-center gap-8 bg-white/10 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-xl border border-white/20">
          <div className="flex flex-col gap-4 text-white">
            <h1 className="lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700 drop-shadow-lg text-center tracking-tight">
              Code Together, Anywhere, Anytime!
            </h1>
            <p className="sm:text-2xl font-medium text-gray-200 opacity-90 drop-shadow-md text-center leading-relaxed">
              Collaborate in real-time with <span className="text-blue-400">seamless coding</span> & <span className="text-purple-400">instant updates</span>.
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
              name='code'
              placeholder="Enter Room Code"
              className='border-b outline-none text-white text-center px-4 py-2 lg:text-xl md:text-lg w-full rounded-md shadow-md focus:ring-2 focus:ring-green-600 bg-transparent placeholder-gray-400'
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomAccess;
