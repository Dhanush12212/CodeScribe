import React, { useState } from "react";

const InputPopup = ({ inputValue, setInputValue, onSubmit, onCancel }) => {
  const [localInput, setLocalInput] = useState(inputValue || "");

  const handleSubmit = () => {
    if (localInput.trim() === "") return; // prevent empty submission
    onSubmit(localInput);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent newline
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      {/* Overlay with blur */}
      <div className="absolute inset-0 backdrop-blur-[1px] bg-black/40"></div>

      {/* Popup content */}
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl w-2/5 max-w-2xl shadow-2xl animate-fadeIn">
        <h2 className="text-white mb-6 text-2xl font-bold text-center">
          Enter Your Input
        </h2>

        <textarea
          value={localInput}
          onChange={(e) => setLocalInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-4 mb-6 rounded-lg border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-400 resize-none h-48 placeholder-gray-400 text-lg"
          placeholder="Type your input here..."
        />

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-200 shadow-md font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-700 to-green-800 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md font-medium"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputPopup;
