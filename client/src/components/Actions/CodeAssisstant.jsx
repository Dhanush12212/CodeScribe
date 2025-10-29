import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react'; // ✅ Spinner icon

function CodeAssisstant() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false); // ✅ loading state
  const textareaRef = useRef(null);

  const handleAsk = async () => {
    if (!query.trim()) return;
    console.log("User asked:", query);
    setLoading(true);

    // Simulate processing time (replace this with actual async logic later)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setLoading(false);
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
          disabled={loading}
          className={`text-white px-5 py-3 rounded-md flex items-center justify-center gap-2 flex-shrink-0 mb-1 transition-all duration-200 shadow-md ${
            loading ? 'opacity-80 cursor-not-allowed' : ''
          }`}
          style={{
            backgroundColor: "#2563eb", 
            border: "1px solid #2563eb",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#1d4ed8";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#2563eb";
          }}
        >
          {loading && <Loader2 className="animate-spin h-5 w-5" />} 
          {loading ? 'Processing...' : 'Ask'}
        </button>
      </div>
    </div>
  );
}

export default CodeAssisstant;
