import { useState, useEffect } from "react";
import axios from "axios";
import InputPopup from "../UI/InputPopup";
import { API_URL } from "../../../config";
import { Session } from "../../utils/storage";

const STORAGE_KEY = "code_runner_output";

const CodeRunner = ({ editorRef, languageId, showRunPopup, setShowRunPopup }) => {
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isError, setIsError] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
 
  useEffect(() => {
    const saved = Session.get(STORAGE_KEY);
    if (saved) {
      setOutput(saved.output || null);
      setIsError(saved.isError || false);
      setExecutionTime(saved.executionTime || null);
      setInputValue(saved.inputValue || "");
    }
  }, []);
 
  const saveToSession = (data) => {
    Session.set(STORAGE_KEY, {
      output: data.output,
      isError: data.isError,
      inputValue: data.inputValue,
      executionTime: data.executionTime,
    });
  };

  const pollResult = async (token) => {
    try {
      const res = await axios.get(
        `${API_URL}/execute/result/${token}`,
        { withCredentials: true }
      );
      const data = res.data;

      if (data.status.id >= 3) {
        return data;
      } else {
        await new Promise((r) => setTimeout(r, 2500));
        return await pollResult(token);
      }
    } catch (err) {
      console.error("Error polling result:", err);
      throw err;
    }
  };

  const runCode = async (userInput) => {
    if (!editorRef.current) return;
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;

    try {
      setIsLoading(true);
      setInputValue(userInput);

      const runResponse = await axios.post(
        `${API_URL}/execute/runCode`,
        {
          source_code: sourceCode,
          language_id: languageId,
          stdin: userInput,
        },
        { withCredentials: true }
      );

      const token = runResponse.data.token;
      if (!token) throw new Error("Failed to get submission token");

      const result = await pollResult(token);
      setExecutionTime(result.time);

      let finalOutput = [];
      let isErr = false;

      if (result.compile_output) {
        finalOutput = result.compile_output.split("\n");
        isErr = true;
      } else if (result.stderr) {
        finalOutput = result.stderr.split("\n");
        isErr = true;
      } else {
        finalOutput = result.stdout ? result.stdout.split("\n") : [];
        isErr = false;
      }

      setOutput(finalOutput);
      setIsError(isErr);
 
      saveToSession({
        output: finalOutput,
        isError: isErr,
        inputValue: userInput,
        executionTime: result.time,
      });

    } catch (error) {
      console.error(error);
      alert(error.message || "Unable to run code");

      setOutput([]);
      setIsError(true);

      saveToSession({
        output: [],
        isError: true,
        inputValue: userInput,
        executionTime: null,
      });

    } finally {
      setIsLoading(false);
      setShowRunPopup(false);
      setInputValue("");
    }
  };

  return (
    <div
      className="rounded-md h-[91vh] p-3 flex flex-col"
      style={{
        border: `1px solid ${isError ? "#ef4444" : "#333"}`,
        backgroundColor: "#0f0f0f",
        color: `${isError ? "#ef4444" : "#e5e7eb"}`,
        transition: "border-color 0.3s ease",
        overflow: "hidden",
      }}
    >
      <div className="flex justify-end gap-3 mb-2">
        <button
          onClick={() => setShowRunPopup(true)}
          className="px-4 py-3 text-sm font-medium rounded-md bg-gray-700 hover:bg-gray-600 text-white transition"
        >
          Input
        </button>

        <button
          onClick={() => runCode("")}
          className="px-4 py-3 text-sm font-medium rounded-md bg-green-700 hover:bg-green-600 text-white transition"
        >
          Run Code
        </button>
      </div>

      {showRunPopup && (
        <InputPopup
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSubmit={runCode}
          onCancel={() => setShowRunPopup(false)}
        />
      )}

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
        <div className="flex flex-1 justify-center items-start mt-12">
          <p className="text-center text-gray-500">
            Click <span className="text-green-400 font-semibold">'Run Code'</span> to execute and view output here.
          </p>
        </div>
      )}
    </div>
  );
};

export default CodeRunner;
