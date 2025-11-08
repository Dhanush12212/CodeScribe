import { useState } from "react";
import axios from "axios";
import InputPopup from "../InputPopup";
import { API_URL } from "../../../config";

const POLL_INTERVAL = 2500; 

const CodeRunner = ({ editorRef, languageId, showRunPopup, setShowRunPopup }) => {
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isError, setIsError] = useState(false);
  const [executionTime, setExecutionTime] = useState(null)

  const pollResult = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/execute/result/${token}`,
        {withCredentials: true}
      );
      const data = res.data; 
      
      if (data.status.id >= 3) {  
        return data;
      } else {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL));
        return await pollResult(token);
      }
    } catch (err) {
      console.error("Error polling result:", err);
      throw err;
    }
  };
  
  // Run code
  const runCode = async (userInput) => {
    if (!editorRef.current) return;
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    
    try {
      setIsLoading(true);
      setInputValue(userInput);
      
      const runResponse = await axios.post( `${API_URL}/execute/runCode`,
        {
          source_code: sourceCode,
          language_id: languageId,
          stdin: userInput,
        },
        {
          withCredentials: true,
        }
      );

      
      const token = runResponse.data.token;
      if (!token) throw new Error("Failed to get submission token");
      
      const result = await pollResult(token);
      setExecutionTime(result.time);

      if (result.compile_output) {
        setOutput(result.compile_output.split("\n"));
        setIsError(true);
      } else if (result.stderr) {
        setOutput(result.stderr.split("\n"));
        setIsError(true);
      } else {
        setOutput(result.stdout ? result.stdout.split("\n") : []);
        setIsError(false);
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to run code");
      setOutput([]);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setShowRunPopup(false);
      setInputValue("");
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Input Popup */}
      {showRunPopup && (
        <InputPopup
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSubmit={runCode}
          onCancel={() => setShowRunPopup(false)}
        />
      )}

      {/* Code Output */}
      <div
        className="rounded-md h-[85vh] md:h-[75vh] lg:h-[90vh] overflow-y-auto p-3 text-gray-200"
        style={{
          border: `1px solid ${isError ? "#ef4444" : "#333"}`,
          backgroundColor: "#0f0f0f",
          transition: "border-color 0.3s ease",
        }}
      >
        <p className="mb-3 text-xl text-gray-500 text-center font-bold">Output</p>

        {executionTime && (
          <span className="flex justify-end text-gray-400 mb-2">
            Execution time: {executionTime}s
          </span>
        )}

        {isLoading ? (
          <p className="text-center text-gray-400">Running...</p>
        ) : output ? (
          output.map((line, i) => <p key={i}>{line}</p>)
        ) : (
          <p className="text-center text-gray-500">
            Click <span className="text-green-400 font-semibold">'Run Code'</span> to execute and
            view output here.
          </p>
        )}
      </div>
    </div>
  );
};

export default CodeRunner;
