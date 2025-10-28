import React, { useState } from "react";

const InputPopup = ({ inputValue, setInputValue, onSubmit, onCancel }) => {
  const [localInput, setLocalInput] = useState(inputValue || "");

  const handleSubmit = () => {
    if (localInput=== null) return;
    onSubmit(localInput);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex justify-center items-center"> 
      <div className="absolute inset-0 bg-black/40 rounded-md"></div>

      {/* Popup content */}
      <div
        className="relative p-6 rounded-2xl w-4/5 max-w-lg shadow-2xl z-30"
        style={{
          background: "linear-gradient(to bottom right, #1f2937, #111827)",  
          border: "1px solid #4b5563",  
        }}
      >
        <h2 className="text-white mb-4 text-xl font-bold text-center">
          Enter Your Input
        </h2>

        <textarea
          value={localInput}
          onChange={(e) => setLocalInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 mb-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-green-500 resize-none h-36 placeholder-gray-400 text-base"
          placeholder="Type your input here..."
          style={{
            border: "1px solid #4b5563", 
            transition: "border-color 0.3s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#22c55e")} 
          onBlur={(e) => (e.target.style.borderColor = "#4b5563")} 
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-lg text-white transition-colors duration-200 shadow-md font-medium"
            style={{
              backgroundColor: "#374151", 
              border: "1px solid #4b5563",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4b5563")} 
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#374151")}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg text-white transition-all duration-200 shadow-md font-medium"
            style={{
              background: "linear-gradient(to right, #15803d, #166534)",
              border: "1px solid #16a34a",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(to right, #16a34a, #15803d)") 
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(to right, #15803d, #166534)")
            }
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputPopup;
