import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios";
import { MdOutlineMail, MdOutlinePassword } from "react-icons/md";  
import { FaRegEye, FaRegEyeSlash, FaUser } from "react-icons/fa"; 
import { SiJavascript, SiReact, SiHtml5, SiCss3 } from "react-icons/si";
import { API_URL, clientID } from "../../../config"; 
import GoogleAuth from './GoogleAuth';

function RegisterPage({ register }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordView = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API_URL}/auth/register`,
        { username, email, password },
        { withCredentials: true }
      );  
      
      const { user } = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      setMessage({ text: "🎉 Registered Successfully!", type: "success" });

      setTimeout(() => navigate("/"), 500);
    } catch (error) {
      console.error("Register failed:", error.response?.data || error.message);
      setMessage({ text: "Register Failed. Try again", type: "error" });
    }
  };

  const codeIcons = [<SiJavascript key="js" />, <SiReact key="react" />, <SiHtml5 key="html" />, <SiCss3 key="css" />];

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 animate-gradient-bg"></div>
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Floating Code Icons */}
      <div className="absolute w-full h-full">
        {codeIcons.map((icon, i) => (
          <div
            key={i}
            className="absolute text-white/20 text-4xl animate-float-code"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 5}s`,
              fontSize: `${Math.random() * 40 + 20}px`,
            }}
          >
            {icon}
          </div>
        ))}
      </div>

      {/* Register Form */}
      <form
        onSubmit={handleSubmit}
        className="relative z-20 w-full max-w-lg sm:max-w-xl p-12 sm:p-16 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col items-center gap-6 text-white border border-white/20"
      >
        <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 text-center mb-2">
          Create Account
        </h1>

        {message.text && (
          <p className={`text-sm sm:text-base font-medium ${message.type === "success" ? "text-green-400" : "text-red-400"} animate-pulse`}>
            {message.text}
          </p>
        )}

        {/* Inputs */}
        <div className="w-full flex flex-col gap-6">
          <div className="flex items-center gap-3 bg-gray-800 p-5 rounded-2xl hover:bg-gray-700 transition-all duration-300 shadow-inner">
            <FaUser className="text-white text-xl" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="bg-transparent border-none outline-none w-full text-lg placeholder-gray-400 text-white"
              required
            />
          </div>

          <div className="flex items-center gap-3 bg-gray-800 p-5 rounded-2xl hover:bg-gray-700 transition-all duration-300 shadow-inner">
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

          <div className="flex items-center gap-3 bg-gray-800 p-5 rounded-2xl relative hover:bg-gray-700 transition-all duration-300 shadow-inner">
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

        {/* Register Button */}
        <button
          type="submit"
          className="w-full py-4 text-lg sm:text-xl font-semibold text-white bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl shadow-lg hover:from-green-500 hover:to-blue-600 transition-all duration-300"
        >
          Register
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
        <p className="text-sm sm:text-base text-gray-400 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Sign in
          </Link>
        </p>
      </form>

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

export default RegisterPage;
