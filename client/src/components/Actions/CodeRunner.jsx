import { useState, useEffect } from "react";
import { executeCode } from "../../api";
import { socket } from "../../socket/socket";
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

  // 🔹 Open modal when ActionPanel triggers it
  useEffect(() => {
    if (showRunPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showRunPopup]);

  return (
    <div className="relative w-full h-full">
      {showRunPopup && (
        <InputPopup
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSubmit={runCode}
          onCancel={() => setShowRunPopup(false)}
        />
      )}

      <div
        className={`rounded-md h-[85vh] md:h-[75vh] lg:h-[90vh] overflow-y-auto p-3 ${
          isError ? "text-red-400 border-red-500" : "text-gray-200 border-[#333]"
        } border`}
      >
        <p className="mb-3 text-xl text-gray-500 text-center font-bold">Output</p>
        {isLoading
          ? "Running..."
          : output
          ? output.map((line, i) => <p key={i}>{line}</p>)
          : "Click 'Run Code' to execute and view output here."}
      </div>
    </div>
  );
};

export default CodeRunner;
