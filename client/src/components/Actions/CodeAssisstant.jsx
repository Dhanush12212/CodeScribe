import React, { useState, useRef, useEffect } from 'react';

function CodeAssisstant() {
  const [query, setQuery] = useState('');
  const textareaRef = useRef(null);

  const handleAsk = () => {
    if (!query.trim()) return;
    console.log("User asked:", query);
    setQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
  };

  const handleInput = (e) => {
    setQuery(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, []);

  return (
    <div
      className="relative h-[85vh] md:h-[75vh] lg:h-[90vh] flex flex-col justify-end text-white"
      style={{
        backgroundColor: "#111827",
        border: "1px solid #374151", 
      }}
    >
      {/* Bottom input bar */}
      <div
        className="p-3 flex items-end gap-2 sticky bottom-0"
        style={{
          backgroundColor: "#1f2937", 
          borderTop: "1px solid #374151", 
        }}
      >
        <textarea
          ref={textareaRef}
          value={query}
          onChange={handleInput}
          placeholder="Type your question..."
          className="flex-1 outline-none text-white rounded-md p-3 resize-none overflow-hidden text-lg"
          style={{
            backgroundColor: "#374151", 
            border: "1px solid #4b5563",
            transition: "border-color 0.3s ease",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")} 
          onBlur={(e) => (e.target.style.borderColor = "#4b5563")} 
        />
        <button
          onClick={handleAsk}
          className="text-white px-5 py-3 rounded-md flex-shrink-0 mb-1 transition-all duration-200 shadow-md"
          style={{
            backgroundColor: "#2563eb", 
            border: "1px solid #2563eb",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
        >
          Ask
        </button>
      </div>
    </div>
  );
}

export default CodeAssisstant;
