import React, { useEffect } from "react";
import { useRef } from "react";

function AIPromptModal({ AIPrompt, setAIPrompt, onCancel, onSubmit }) {

  const textAreaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); 
      onSubmit();
    }
  };

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  return (
    <div className="absolute inset-0 z-50 bg-black/55 flex items-center">
      <div
        className="bg-[#1e1e2e] p-6 rounded-xl shadow-xl w-[420px]"
        style={{
          border: "1px solid rgba(255,255,255,0.1)",
          marginLeft: "200px"
        }}
      >
        <h2 className="text-lg font-semibold mb-3 text-white">AI Code Assistant</h2>
 
        <textarea
          ref={textAreaRef}
          value={AIPrompt} 
          onChange={(e) => setAIPrompt(e.target.value)} 
          onKeyDown={handleKeyDown}
          placeholder="Explain what change you want..."
          className="w-full p-3 mb-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-green-500 resize-none h-36 placeholder-gray-400 text-base"
          style={{
            border: "1px solid #4b5563", 
            transition: "border-color 0.3s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#22c55e")} 
          onBlur={(e) => (e.target.style.borderColor = "#4b5563")} 
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-lg text-white bg-gray-700 hover:bg-gray-600 transition"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className="px-5 py-2 rounded-lg text-white bg-green-700 hover:bg-green-600 transition"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIPromptModal;
