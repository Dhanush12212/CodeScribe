import React, { useState } from "react";
import { Info } from "lucide-react"; // 🔹 import icon
import Output from "./Actions/Output";
import CodeAssisstant from "./Actions/CodeAssisstant";
import CodeExplain from "./Actions/CodeExplain";
import RelatedPrograms from "./Actions/RelatedPrograms";

const ActionPanel = ({ editorRef, language }) => {
  const [activeComponent, setActiveComponent] = useState("output");
  const [showInfo, setShowInfo] = useState(false);

  const renderComponent = () => {
    switch (activeComponent) {
      case "output":
        return <Output editorRef={editorRef} language={language} />;
      case "Code Assisstant":
        return <CodeAssisstant />;
      case "Explain Code":
        return <CodeExplain />;
      case "Related Programs":
        return <RelatedPrograms />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full mt-2 relative">
      {/* --- Buttons Row with Info Icon --- */}
      <div className="flex gap-3 w-full items-center mx-2">
        {/* Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          <button
            onClick={() => setActiveComponent("output")}
            className={`w-full py-3 rounded-md font-medium border transition-all duration-200 ${
              activeComponent === "output"
                ? "bg-green-600 text-white border-green-600"
                : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            }`}
          >
            Run Code
          </button>

          <button
            onClick={() => setActiveComponent("Code Assisstant")}
            className={`w-full py-3 rounded-md font-medium border transition-all duration-200 ${
              activeComponent === "Code Assisstant"
                ? "bg-blue-600 text-white border-blue-600"
                : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
            }`}
          >
            Code Assistant
          </button>

          <button
            onClick={() => setActiveComponent("Explain Code")}
            className={`w-full py-3 rounded-md font-medium border transition-all duration-200 ${
              activeComponent === "Explain Code"
                ? "bg-purple-600 text-white border-purple-600"
                : "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
            }`}
          >
            Explain Code
          </button>

          <button
            onClick={() => setActiveComponent("Related Programs")}
            className={`w-full py-3 rounded-md font-medium border transition-all duration-200 ${
              activeComponent === "Related Programs"
                ? "bg-gray-600 text-white border-gray-600"
                : "border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white"
            }`}
          >
            Related Programs
          </button>
        </div>

        {/* Info Icon */}
        <button
          onClick={() => setShowInfo(true)}
          className="p-2 rounded-full border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-white transition-all duration-200"
          title="Feature Info"
        >
          <Info size={22} />
        </button>
      </div>
 
      <div className="flex-1 overflow-y-auto rounded-md bg-[#0f0f0f] p-2">
        {renderComponent()}
      </div>

      {/* --- Info Popup Modal --- */}
      {showInfo && (
        <div className="fixed inset-0 flex justify-center items-center backdrop-blur-[3px] bg-black/20 z-50">
          <div className="bg-[#1a1a1a] text-white rounded-lg shadow-lg p-8 w-[95%] max-w-2xl h-[50vh] overflow-y-auto border border-yellow-600">
            <h2 className="text-2xl font-bold mb-6 text-yellow-400 text-center">
              Feature Information
            </h2>

            <ul className="space-y-5 text-base text-gray-300 leading-relaxed">
              <li>
                <span className="font-semibold text-green-400">Run Code:</span>{" "}
                Executes your written code and displays real-time output.
              </li>
              <li>
                <span className="font-semibold text-blue-400">Code Assistant:</span>{" "}
                An AI-driven assistant that helps you debug, optimize, or generate
                new code based on your input.
              </li>
              <li>
                <span className="font-semibold text-purple-400">Explain Code:</span>{" "}
                Offers a line-by-line explanation of your code to help you
                understand its logic and structure.
              </li>
              <li>
                <span className="font-semibold text-gray-600">Related Programs:</span>{" "}
                Displays similar or relevant coding examples to deepen your learning.
              </li>
            </ul>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setShowInfo(false)}
                className="px-6 py-2 rounded-md bg-yellow-600 text-white hover:bg-yellow-500 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionPanel;
