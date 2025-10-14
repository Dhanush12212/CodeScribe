import React, { useState, useRef, useEffect } from 'react'

function CodeAssisstant() {
  const [query, setQuery] = useState('');
  const textareaRef = useRef(null);

  const handleAsk = () => {
    if (!query.trim()) return;
    console.log("User asked:", query);
    setQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px"; // reset to initial height
    }
  };

  const handleInput = (e) => {
    setQuery(e.target.value);

    // Auto-expand height
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px"; // reset to minimum height
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px"; // initial height
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, []);

  return (
    <div className='relative h-[85vh] md:h-[75vh] lg:h-[90vh] border flex flex-col justify-end bg-gray-900 text-white'>
      
      {/* Bottom input bar */}
      <div className='p-3 border-t border-gray-700 flex items-end gap-2 bg-gray-800 sticky bottom-0'>
        <textarea
          ref={textareaRef}
          value={query}
          onChange={handleInput}
          placeholder="Type your question..."
          className="flex-1 outline-none bg-gray-700 text-white rounded-md p-3 resize-none overflow-hidden text-lg"
        />
        <button 
          onClick={handleAsk}
          className="bg-blue-600 text-white px-5 py-3 rounded-md hover:bg-blue-700 transition flex-shrink-0 mb-1"
        >
          Ask
        </button>
      </div>
    </div>
  )
}

export default CodeAssisstant
