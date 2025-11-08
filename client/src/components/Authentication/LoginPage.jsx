import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios";  
import { MdOutlineMail, MdOutlinePassword } from "react-icons/md";  
import { FaRegEye, FaRegEyeSlash, FaUser, FaPython, FaJava } from "react-icons/fa"; 
import { SiJavascript, SiReact, SiHtml5, SiCss3, SiCplusplus } from "react-icons/si";
import { API_URL, clientID } from "../../../config"; 
import GoogleAuth from './GoogleAuth';  

function Login({ login }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false); 

  const togglePasswordView = () => setShowPassword(!showPassword); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      const { user } = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));      
      setMessage({ text: "🎉 Login Successful!", type: "success" });
      setTimeout(() => navigate("/room"), 500);
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      setMessage({ text: "Login Failed. Check your credentials.", type: "error" });
    }
  };  

  const codeIcons = [<SiJavascript key="js" />, <SiReact key="react" />, <SiHtml5 key="html" />, <SiCss3 key="css"/>, <FaPython key="python"/>, <SiCplusplus  key="c++"/>, <FaJava key="java"/>];

  const iconStyles = useMemo(() =>
    codeIcons.map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 10 + 5}s`,
      fontSize: `${Math.random() * 40 + 20}px`,
    })),
    []
  );

  const FloatingIcons = useMemo(() => (
    <div className="absolute w-full h-full">
      {codeIcons.map((icon, i) => (
        <div
          key={i}
          className="absolute text-white/20 text-4xl animate-float-code"
          style={iconStyles[i]}
        >
          {icon}
        </div>
      ))}
    </div>
  ), [iconStyles, codeIcons]);


  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden"> 
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 animate-gradient-bg"></div>
      <div className="absolute inset-0 bg-black/40"></div>
 
      <div className="absolute w-full h-full">
        {FloatingIcons} 
      </div>

      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        className="relative z-20 w-full max-w-lg sm:max-w-xl p-12 sm:p-16 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col items-center gap-6 text-white"
        style={{ border: "1px solid rgba(255,255,255,0.2)" }}
      >
        <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 text-center mb-2">
          Welcome Back
        </h1>

        {message.text && (
          <p className={`text-sm sm:text-base font-medium ${message.type === "success" ? "text-green-400" : "text-red-400"} animate-pulse`}>
            {message.text}
          </p>
        )}

        {/* Inputs */}
        <div className="w-full flex flex-col gap-4">
          <div
            className="mt-5 flex items-center gap-3 bg-gray-800 p-5 rounded-2xl hover:bg-gray-700 transition-all duration-300 shadow-inner"
            style={{ border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <MdOutlineMail className="text-white text-xl" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="bg-transparent border-none outline-none w-full text-lg placeholder-gray-400 text-white"
              required
            />
          </div>

          <div
            className="flex items-center gap-3 bg-gray-800 p-5 rounded-2xl relative hover:bg-gray-700 transition-all duration-300 shadow-inner"
            style={{ border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <MdOutlinePassword className="text-white text-xl" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="bg-transparent border-none outline-none w-full text-lg placeholder-gray-400 text-white"
              required
            />
            {showPassword ? (
              <FaRegEyeSlash
                onClick={togglePasswordView}
                className="absolute right-5 text-white cursor-pointer"
              />
            ) : (
              <FaRegEye
                onClick={togglePasswordView}
                className="absolute right-5 text-white cursor-pointer"
              />
            )}
          </div>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full py-4 text-lg sm:text-xl font-semibold text-white bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl shadow-lg hover:from-green-500 hover:to-blue-600 transition-all duration-300"
          style={{ border: "1px solid rgba(255,255,255,0.2)" }}
        >
          Login
        </button>

        {/* Divider */}
        <div className="flex items-center w-full">
          <div className="flex-1 h-px bg-gray-600"></div>
          <span className="px-4 text-sm sm:text-base text-gray-400">or continue with</span>
          <div className="flex-1 h-px bg-gray-600"></div>
        </div>

        {/* Social Login */}
        <div className="flex justify-center w-full">
          <GoogleAuth clientID={clientID} setMessage={setMessage} navigate={navigate} />
        </div>

        {/* Footer */}
        <div className="text-sm sm:text-base text-gray-300 w-full text-center">
          <Link to="#" className="hover:underline">
            Forgot Password?
          </Link>
        </div>

        <p className="text-sm sm:text-base text-gray-400 text-center">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-blue-400 hover:underline">
            Sign up
          </Link>
        </p>
      </form>

      {/* Tailwind Animations */}
      <style>
        {`
          @keyframes float-code {
            0% { transform: translateY(0) translateX(0) rotate(0deg); }
            50% { transform: translateY(-30px) translateX(20px) rotate(15deg); }
            100% { transform: translateY(0) translateX(0) rotate(0deg); }
          }
          .animate-float-code {
            animation: float-code infinite ease-in-out;
          }

          @keyframes gradient-bg {
            0%,100%{background-position:0% 50%;}
            50%{background-position:100% 50%;}
          }
          .animate-gradient-bg {
            background-size: 200% 200%;
            animation: gradient-bg 20s ease infinite;
          }
        `}
      </style>
    </div>
  );
}

export default Login;
