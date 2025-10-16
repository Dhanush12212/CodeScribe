import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const [code] = useState(`function greet(name) {
  return "Hello, " + name + "!";
}`);

  const [explanation, setExplanation] = useState("");

  const handleOnClick = () => {
    navigate("/room");
  };

  const handleExplainCode = () => {
    // Simulated AI explanation (replace with your backend API later)
    setExplanation(
      "This function takes a 'name' as an argument and returns a greeting string. It uses string concatenation to create 'Hello, [name]!'"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-inter overflow-x-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-6">
        <h1 className="text-3xl font-bold text-cyan-400">CodeScribe</h1>
        <div className="space-x-6">
          <a href="#features" className="hover:text-cyan-400 transition">
            Features
          </a>
          <a href="#tech" className="hover:text-cyan-400 transition">
            Tech Stack
          </a>
          <button
            onClick={handleOnClick}
            className="hover:text-cyan-400 transition"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-10 md:px-20 py-20">
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="flex-1"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Collaborate. <span className="text-cyan-400">Code.</span> Create.
          </h2>
          <p className="mt-6 text-gray-300 text-lg max-w-xl">
            CodeScribe lets you code together in real-time, with AI assistance
            and instant execution — perfect for interviews, pair programming, or
            team projects.
          </p>
          <div className="mt-8 space-x-4">
            <button
              onClick={handleOnClick}
              className="px-6 py-3 bg-cyan-500 text-black font-semibold rounded-xl shadow-lg hover:bg-cyan-400 transition transform hover:-translate-y-1"
            >
              Get Started
            </button>
          </div>
        </motion.div>

        {/* Animated Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="flex-1 mt-12 md:mt-0"
        >
          <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-700">
            <div className="flex space-x-2 mb-4">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            </div>
            <pre className="text-cyan-300 text-sm md:text-base font-mono">
              {`// Live collaboration with AI
              function CodeTogether() {
                const [code, setCode] = useState("");
                return <Editor code={code} onChange={setCode} />;
              }`}
            </pre>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-gradient-to-b from-gray-900 to-gray-800"
      >
        <h3 className="text-center text-4xl font-bold mb-12">
          Powerful <span className="text-cyan-400">Features</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-10 md:px-20">
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
              className="p-6 bg-gray-800 rounded-2xl shadow-lg hover:shadow-cyan-500/20 border border-gray-700 hover:-translate-y-2 transition-transform"
            >
              <h4 className="text-2xl font-semibold text-cyan-400 mb-3">
                {feature.title}
              </h4>
              <p className="text-gray-300">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Code Explanation Feature */}
      <section
        id="explain"
        className="py-20 px-10 md:px-20 bg-gradient-to-b from-gray-800 to-gray-900"
      >
        <h3 className="text-4xl font-bold text-center mb-10">
          <span className="text-cyan-400">AI Code Explanation</span> Demo
        </h3>

        <div className="max-w-4xl mx-auto bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-6">
          <pre className="text-cyan-300 font-mono text-sm md:text-base overflow-x-auto mb-6">
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
              className="bg-gray-900 p-4 rounded-xl border border-gray-700 text-gray-300"
            >
              <p>{explanation}</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="py-20 text-center">
        <h3 className="text-4xl font-bold mb-12">
          Built with Modern <span className="text-cyan-400">Technologies</span>
        </h3>
        <div className="flex flex-wrap justify-center gap-6 text-gray-300 text-lg">
          {[
            "React.js",
            "Node.js",
            "Express.js",
            "MongoDB",
            "Socket.IO",
            "OpenAI API",
            "Tailwind CSS",
          ].map((tech) => (
            <motion.div
              key={tech}
              whileHover={{ scale: 1.1 }}
              className="px-5 py-3 bg-gray-800 rounded-xl border border-gray-700 hover:border-cyan-400 transition"
            >
              {tech}
            </motion.div>
          ))}
        </div>
      </section>
 
    </div>
  );
}
