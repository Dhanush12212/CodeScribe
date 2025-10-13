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

function LandingPage() {
  const [roomId, setRoomId] = useState(""); 
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  }); 

  const navigate = useNavigate();  

  // Welcome back popup
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

  // Socket listeners
  useEffect(() => {
    socket.on('connect', () => console.log(`Connected: ${socket.id}`));
    socket.on('roomJoined', ({ roomId, message }) => {
      console.log(message);
      Swal.close(); // Close loader popup
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

  // Tailwind Loader Popup
  const showLoader = (message) => {
    MySwal.fire({
      title: `<p class="text-2xl font-bold text-cyan-400 tracking-wide">${message}</p>`,
      html: `
        <div class="flex flex-col items-center justify-center gap-8 py-4">
          <div class="w-16 h-16 border-4 border-t-cyan-400 border-gray-600 rounded-full animate-spin shadow-[0_0_20px_#06b6d4]"></div>
          <div class="w-3/4 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div id="progressBar" class="h-full bg-gradient-to-r from-cyan-400 to-blue-500 w-0 transition-all duration-300 ease-linear rounded-full shadow-[0_0_15px_#06b6d4]"></div>
          </div>
          <p class="text-gray-300 text-sm italic">Please wait while we set things up...</p>
        </div>
      `,
      showConfirmButton: false,
      allowOutsideClick: false,
      background: 'rgba(17, 24, 39, 0.95)', // bg-gray-900/95
      color: '#fff',
      width: '500px',
      padding: '2rem 1.5rem',
      customClass: {
        popup: 'rounded-3xl shadow-2xl backdrop-blur-xl border border-gray-700',
      },
      didOpen: () => {
        let width = 0;
        const bar = Swal.getPopup().querySelector('#progressBar');
        const interval = setInterval(() => {
          width = (width + 3) % 100;
          bar.style.width = width + '%';
        }, 100);
        Swal.stopProgress = () => clearInterval(interval);
      },
      willClose: () => {
        Swal.stopProgress?.();
      }
    });
  };

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
    showLoader('Joining Room...');
    socket.emit('joinRoom', roomId);
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
    showLoader('Creating Room...');
    socket.emit('joinRoom', roomId);
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
      console.error("Logout Error: ", error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-6 sm:px-0 relative">
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

      {/* Container */}
      <div className="absolute flex flex-col py-20 sm:py-40 items-center text-center gap-8 bg-white/10 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-xl border border-white/20">
        <div className="flex flex-col gap-4 text-white">
          <h1 className="Text lg:text-5xl md:text-5xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700 drop-shadow-lg text-center tracking-tight">
            Code Together, Anywhere, Anytime!
          </h1>
          <p className="desc sm:text-2xl font-medium sm:font-semibold text-gray-200 opacity-90 drop-shadow-md text-center leading-relaxed">
            Collaborate in real-time with <span className="text-blue-400">seamless coding</span> & <span className="text-purple-400">instant updates</span>.
          </p>
        </div>

        <div className="flex gap-6">
          <button 
            className="px-8 py-4 text-lg font-semibold text-white bg-blue-700 rounded-xl shadow-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 transition-all duration-300 cursor-pointer"
            onClick={handleCreateRoom}
          >
            Create Room
          </button>
          <button 
            className="px-8 py-4 text-lg font-semibold text-white bg-green-700 rounded-xl shadow-md hover:bg-green-600 focus:ring-2 focus:ring-green-300 transition-all duration-300 cursor-pointer"
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
  );
}

export default LandingPage;
