import { useState } from "react";
import { executeCode } from "../../api";
import InputPopup from "../InputPopup";

const CodeRunner = ({ editorRef, language, showRunPopup, setShowRunPopup }) => {
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isError, setIsError] = useState(false);

  const runCode = async (userInput) => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;

    try {
      setIsLoading(true);
      setInputValue(userInput);
      const { run: result } = await executeCode(language, sourceCode, userInput);
      setOutput(result.output.split("\n"));
      setIsError(!!result.stderr);
    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to run code");
    } finally {
      setIsLoading(false);
      setShowRunPopup(false);
      setInputValue("");
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Inline Popup */}
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
          border: `1px solid ${isError ? "#ef4444" : "#333"}`, // red-500 : custom dark gray
          backgroundColor: "#0f0f0f",
          transition: "border-color 0.3s ease",
        }}
      >
        <p className="mb-3 text-xl text-gray-500 text-center font-bold">Output</p>

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
