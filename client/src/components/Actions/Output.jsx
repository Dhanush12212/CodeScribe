import { useState } from "react";
import { executeCode } from "../../api";
import { socket } from "../../socket/socket";
import InputPopup from "../InputPopup"; 

const Output = ({ editorRef, language }) => {
  const [output, setOutput] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isError, setIsError] = useState(false);
 
  const handleRun = () => {
    setShowModal(true);
  };

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
      setShowModal(false);
      setInputValue("");
    }
  };

  return (
    <div className="relative w-full h-full">
      {showModal && (
        <InputPopup
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSubmit={runCode}
          onCancel={() => setShowModal(false)}
        />
      )}

      <div className="transition-all">

        <div
          className={`rounded-md h-[85vh] md:h-[75vh] lg:h-[90vh] overflow-y-auto p-3 border border-red${
            isError ? "text-red-400 border-red-500" : "text-gray-200 border-[#333]"
          }`}
        >
          <p className="mb-3 text-xl text-gray-500 text-center font-bold">Output</p>
          {isLoading
            ? "Running..."
            : output
            ? output.map((line, i) => <p key={i}>{line}</p>)
            : "Click 'Run Code' from Action Panel to see the output here."}
        </div>
      </div>
    </div>
  );
};

export default Output;
