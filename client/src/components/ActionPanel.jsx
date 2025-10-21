import React, { useState } from "react";
import { Info } from "lucide-react";
import CodeRunner from "./Actions/CodeRunner";
import CodeAssisstant from "./Actions/CodeAssisstant";
import CodeExplain from "./Actions/CodeExplain";
import RelatedPrograms from "./Actions/RelatedPrograms";

const ActionPanel = ({ editorRef, language }) => {
  const [activeComponent, setActiveComponent] = useState("CodeRunner");
  const [showInfo, setShowInfo] = useState(false);
  const [showRunPopup, setShowRunPopup] = useState(false);

  const handleRunClick = () => {
    setActiveComponent("CodeRunner");
    setShowRunPopup(true);  
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "CodeRunner":
        return (
          <CodeRunner
            editorRef={editorRef}
            language={language}
            showRunPopup={showRunPopup}
            setShowRunPopup={setShowRunPopup}
          />
        );
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

  const buttonBaseStyle = "w-full py-3 rounded-md font-medium transition-all duration-200";

  return (
    <div className="flex flex-col w-full mt-2 relative">
      <div className="flex gap-3 w-full items-center mx-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          <button
            onClick={handleRunClick}
            className={buttonBaseStyle}
            style={{
              backgroundColor: activeComponent === "CodeRunner" ? "#166534" : "transparent",
              color: activeComponent === "CodeRunner" ? "#ffffff" : "#16a34a",
              border: "1px solid #16a34a",
            }}
            onMouseEnter={(e) => {
              if (activeComponent !== "CodeRunner") e.target.style.backgroundColor = "#16a34a";
              if (activeComponent !== "CodeRunner") e.target.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              if (activeComponent !== "CodeRunner") e.target.style.backgroundColor = "transparent";
              if (activeComponent !== "CodeRunner") e.target.style.color = "#16a34a";
            }}
          >
            Run Code
          </button>

          <button
            onClick={() => setActiveComponent("Code Assisstant")}
            className={buttonBaseStyle}
            style={{
              backgroundColor: activeComponent === "Code Assisstant" ? "#2563eb" : "transparent",
              color: activeComponent === "Code Assisstant" ? "#ffffff" : "#2563eb",
              border: "1px solid #2563eb",
            }}
            onMouseEnter={(e) => {
              if (activeComponent !== "Code Assisstant") e.target.style.backgroundColor = "#2563eb";
              if (activeComponent !== "Code Assisstant") e.target.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              if (activeComponent !== "Code Assisstant") e.target.style.backgroundColor = "transparent";
              if (activeComponent !== "Code Assisstant") e.target.style.color = "#2563eb";
            }}
          >
            Code Assistant
          </button>

          <button
            onClick={() => setActiveComponent("Explain Code")}
            className={buttonBaseStyle}
            style={{
              backgroundColor: activeComponent === "Explain Code" ? "#7c3aed" : "transparent",
              color: activeComponent === "Explain Code" ? "#ffffff" : "#7c3aed",
              border: "1px solid #7c3aed",
            }}
            onMouseEnter={(e) => {
              if (activeComponent !== "Explain Code") e.target.style.backgroundColor = "#7c3aed";
              if (activeComponent !== "Explain Code") e.target.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              if (activeComponent !== "Explain Code") e.target.style.backgroundColor = "transparent";
              if (activeComponent !== "Explain Code") e.target.style.color = "#7c3aed";
            }}
          >
            Explain Code
          </button>

          <button
            onClick={() => setActiveComponent("Related Programs")}
            className={buttonBaseStyle}
            style={{
              backgroundColor: activeComponent === "Related Programs" ? "#4b5563" : "transparent",
              color: activeComponent === "Related Programs" ? "#ffffff" : "#9ca3af",
              border: "1px solid #4b5563",
            }}
            onMouseEnter={(e) => {
              if (activeComponent !== "Related Programs") e.target.style.backgroundColor = "#4b5563";
              if (activeComponent !== "Related Programs") e.target.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              if (activeComponent !== "Related Programs") e.target.style.backgroundColor = "transparent";
              if (activeComponent !== "Related Programs") e.target.style.color = "#9ca3af";
            }}
          >
            Related Programs
          </button>
        </div>

        {/* Info Icon */}
        <button
          onClick={() => setShowInfo(true)}
          style={{ border: "1px solid #facc15" }}
          className="p-2 rounded-full text-yellow-400 hover:bg-yellow-500 hover:text-white transition-all duration-200"
          title="Feature Info"
        >
          <Info size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto rounded-md bg-[#0f0f0f] p-2">
        {renderComponent()}
      </div>

      {/* --- Info Popup --- */}
      {showInfo && (
        <div
          className="absolute top-[60px] right-3 w-96 bg-[#1a1a1a] rounded-lg shadow-lg p-4 text-white z-20"
          style={{ border: "1px solid #facc15" }}
        >
          <h3 className="text-xl font-bold text-yellow-400 mb-3 text-center">
            Feature Information
          </h3>
          <ul className="space-y-3 text-gray-300 text-sm">
            <li>
              <span className="font-semibold text-green-400">Run Code:</span> Executes your written code and shows real-time output.
            </li>
            <li>
              <span className="font-semibold text-blue-400">Code Assistant:</span> AI helper for debugging, optimizing, or generating code.
            </li>
            <li>
              <span className="font-semibold text-purple-400">Explain Code:</span> Explains your code logic and structure.
            </li>
            <li>
              <span className="font-semibold text-gray-400">Related Programs:</span> Shows relevant code examples.
            </li>
          </ul>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowInfo(false)}
              style={{ border: "1px solid #facc15" }}
              className="px-4 py-2 rounded-md bg-yellow-600 text-black font-semibold hover:bg-yellow-500 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionPanel;
