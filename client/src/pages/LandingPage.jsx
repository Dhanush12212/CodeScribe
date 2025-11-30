import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config";
import axios from "axios";

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [code] = useState(`function greet(name) {
    return "Hello, " + name + "!";
  }`);

  function TypingCodeHero({ code }) {
    const [displayedText, setDisplayedText] = useState("");
    const typingSpeed = 25;

    useEffect(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText((prev) => prev + code.charAt(i));
        i++;
        if (i >= code.length) clearInterval(interval);
      }, typingSpeed);
      return () => clearInterval(interval);
    }, [code]);

    return (
      <pre className="text-cyan-300 text-xs sm:text-sm md:text-base font-mono whitespace-pre-wrap">
        {displayedText}
        <span className="animate-pulse text-cyan-400">|</span>
      </pre>
    );
  }

  const [explanation, setExplanation] = useState("");

  const handleOnClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/auth/isLoggedIn`, {
        withCredentials: true,
      });
      if (res.data?.success) navigate("/room");
      else navigate("/login");
    } catch (err) {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleExplainCode = () => {
    setExplanation(
      "This function takes a 'name' as an argument and returns a greeting string. It uses string concatenation to create 'Hello, [name]!'"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-inter overflow-x-hidden">
      <nav
        className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 sm:px-6 md:px-10 py-5 bg-gray-800/90 backdrop-blur-md"
        style={{ borderBottom: "1px solid #374151" }}
      >
        <h1
          className="text-xl sm:text-2xl md:text-3xl font-bold text-cyan-400 cursor-pointer"
          onClick={() => navigate("/")}
        >
          CodeScribe
        </h1>

        <div className="hidden md:flex space-x-8 text-gray-300">
          <a href="#features" className="hover:text-cyan-400 transition">
            Features
          </a>
          <a href="#tech" className="hover:text-cyan-400 transition">
            Tech Stack
          </a>

          <button
            onClick={handleOnClick}
            disabled={loading}
            className={`flex items-center gap-2 hover:text-cyan-400 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading && (
              <span className="h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></span>
            )}
            {loading ? "Checking..." : "Get Started"}
          </button>
        </div>

        <button
          className="md:hidden text-gray-300 hover:text-cyan-400"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <span className="text-3xl">×</span> : <span className="text-3xl">☰</span>}
        </button>

        {menuOpen && (
          <div
            className="absolute top-full left-0 w-full bg-gray-800 flex flex-col items-center py-6 px-4 space-y-4 md:hidden animate-fadeIn"
            style={{ borderTop: "1px solid #374151" }}
          >
            <a
              onClick={() => setMenuOpen(false)}
              href="#features"
              className="hover:text-cyan-400 transition"
            >
              Features
            </a>
            <a
              onClick={() => setMenuOpen(false)}
              href="#tech"
              className="hover:text-cyan-400 transition"
            >
              Tech Stack
            </a>

            <button
              onClick={() => {
                setMenuOpen(false);
                handleOnClick();
              }}
              disabled={loading}
              className={`px-5 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
                loading
                  ? "bg-cyan-600 opacity-50 cursor-not-allowed"
                  : "bg-cyan-500 hover:bg-cyan-400 text-black"
              }`}
            >
              {loading && (
                <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              )}
              {loading ? "Please Wait..." : "Get Started"}
            </button>
          </div>
        )}
      </nav>

      <section className="flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 md:px-20 py-20 mt-28 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="flex-1 text-center md:text-left"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
            Collaborate. <span className="text-cyan-400">Code.</span> Create.
          </h2>
          <p className="mt-6 text-gray-300 text-base sm:text-lg max-w-xl mx-auto md:mx-0">
            CodeScribe lets you code together in real-time, with AI assistance and instant execution —
            perfect for interviews, pair programming, or team projects.
          </p>
          <div className="mt-8">
            <button
              onClick={handleOnClick}
              disabled={loading}
              className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition transform flex items-center gap-2 ${
                loading
                  ? "bg-cyan-600 opacity-50 cursor-not-allowed"
                  : "bg-cyan-500 hover:bg-cyan-400 text-black hover:-translate-y-1"
              }`}
            >
              {loading && (
                <span className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              )}
              {loading ? "Please Wait..." : "Get Started"}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="flex-1 w-full max-w-xs sm:max-w-sm md:max-w-full mx-auto"
        >
          <div
            className="bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-2xl"
            style={{ border: "1px solid #374151" }}
          >
            <div className="flex space-x-2 mb-4">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            </div>

            <TypingCodeHero
              code={`/// Live collaboration with AI
function CodeTogether() {
  const [code, setCode] = useState("");
  return <Editor code={code} onChange={setCode} />;
}`}
            />
          </div>
        </motion.div>
      </section>

      <section id="features" className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <h3 className="text-center text-3xl sm:text-4xl font-bold mb-12">
          Powerful <span className="text-cyan-400">Features</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 px-6 sm:px-10 md:px-20">
          {[
            {
              title: "Real-time Collaboration",
              desc: "Edit and share code with your teammates instantly using Socket.IO.",
            },
            {
              title: "AI Assistance",
              desc: "Get instant explanations, debugging help, and code suggestions.",
            },
            {
              title: "Run Code Instantly",
              desc: "Execute your code in a secure sandbox and view results live.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="p-6 bg-gray-800 rounded-2xl shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-2 transition-transform"
              style={{ border: "1px solid #374151" }}
            >
              <h4 className="text-xl sm:text-2xl font-semibold text-cyan-400 mb-3">{feature.title}</h4>
              <p className="text-gray-300 text-sm sm:text-base">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="explain" className="py-20 px-6 sm:px-10 md:px-20 bg-gradient-to-b from-gray-900 to-gray-800">
        <h3 className="text-3xl sm:text-4xl font-bold text-center mb-10">
          <span className="text-cyan-400">AI Code Explanation</span> Demo
        </h3>

        <div
          className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6"
          style={{ border: "1px solid #374151" }}
        >
          <pre className="text-cyan-300 font-mono text-xs sm:text-sm md:text-base overflow-x-auto mb-6 p-2">
            {code}
          </pre>
          <div className="flex justify-center mb-6">
            <button
              onClick={handleExplainCode}
              className="px-6 py-3 bg-cyan-500 text-black font-semibold rounded-xl shadow-lg hover:bg-cyan-400 transition transform hover:-translate-y-1"
            >
              Explain This Code
            </button>
          </div>
          {explanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-900 p-4 rounded-xl text-gray-300"
              style={{ border: "1px solid #374151" }}
            >
              <p>{explanation}</p>
            </motion.div>
          )}
        </div>
      </section>

      <section id="tech" className="py-20 text-center bg-gray-900">
        <h3 className="text-3xl sm:text-4xl font-bold mb-12">
          Built with Modern <span className="text-cyan-400">Technologies</span>
        </h3>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-gray-300 text-sm sm:text-lg px-4">
          {[
            "React.js",
            "Node.js",
            "Express.js",
            "MongoDB",
            "Socket.io",
            "Google Auth",
            "Framer-Motion",
            "Tailwind CSS",
            "Judge0 API",
            "Gemini Model",
          ].map((tech) => (
            <motion.div
              key={tech}
              whileHover={{ scale: 1.1 }}
              className="px-4 sm:px-5 py-2 sm:py-3 bg-gray-800 rounded-xl transition"
              style={{ border: "1px solid #374151" }}
            >
              {tech}
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
