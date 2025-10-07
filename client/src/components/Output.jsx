import { useState } from "react";
import { executeCode } from "../api";
import { socket } from "../socket/socket";
import InputPopup from "./InputPopup"; 

const Output = ({ editorRef, language }) => {
  const [output, setOutput] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isError, setIsError] = useState(false);

  // Open the InputPopup
  const handleRunClick = () => {
    setShowModal(true);
  };

  // Run code
  const runCode = async (userInput) => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;

    try {
      setIsLoading(true);
      setInputValue(userInput);  
      const { run: result } = await executeCode(language, sourceCode, userInput);
      setOutput(result.output.split("\n"));
      result.stderr ? setIsError(true) : setIsError(false);
      console.log("User input:", userInput);
    } catch (error) {
      console.log(error);
      alert(error.message || "Unable to run code");
    } finally {
      setIsLoading(false);
      setShowModal(false);
      setInputValue(""); 
    }
  };

  return (
    <div className="relative w-full h-full">
      {showModal ? (
        // Show only InputPopup when modal is active
        <InputPopup
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSubmit={runCode} 
          onCancel={() => setShowModal(false)}
        />
      ) : (
        // Main content (hidden while modal is active)
        <div className="transition-all">
          {/* Title */}
          <p className="mb-2 text-lg">Output</p>

          {/* Run Code Button */}
          <button
            onClick={handleRunClick}  
            disabled={isLoading}
            className={`mb-4 px-4 py-2 rounded-md font-medium transition-colors border ${
              isLoading
                ? "cursor-not-allowed bg-gray-600 text-white border-gray-600"
                : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            }`}
          >
            {isLoading ? "Loading..." : "Run Code"}
          </button>

          {/* Output Box */}
          <div
            className={`rounded-md h-[85vh] md:h-[75vh] lg:h-[85vh] overflow-y-auto p-3  ${
              isError
                ? "text-red-400 border-red-500"
                : "text-gray-200 border-[#333]"
            }`}
          >
            {output
              ? output.map((line, i) => <p key={i}>{line}</p>)
              : 'Click "Run Code" to see the output here'}
          </div>
        </div>
      )}
    </div>
  );
};

export default Output;
