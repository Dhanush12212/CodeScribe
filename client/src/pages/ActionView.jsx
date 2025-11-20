import React, { useState, useEffect } from "react";
import CodeRunner from "../components/Actions/CodeRunner";
import CodeAssisstant from "../components/Actions/CodeAssisstant";
import RoomChat from "../components/Actions/RoomChat";
import CodeReview from "../components/Actions/CodeReview";
import ActionButtons from "../components/Actions/ActionButtons";
import { LANGUAGE_IDS } from '../constants'; 

const ActionView = ({ editorRef, language, languageId }) => {
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
            languageId={languageId}  
            showRunPopup={showRunPopup}
            setShowRunPopup={setShowRunPopup}
          />
        );

      case "Code Assisstant":
        return <CodeAssisstant />;

      case "Room Chat":
        return <RoomChat />;

      case "Code Review":
        return <CodeReview 
        editorRef={editorRef}
        />;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full mt-2 relative">
      <ActionButtons
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
        onRunClick={handleRunClick}
        onShowInfo={() => setShowInfo(true)}
      />

      <div className="flex-1 overflow-y-auto rounded-md bg-[#0f0f0f] p-2">
        {renderComponent()}
      </div>

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
              <span className="font-semibold text-green-400">Run Code:</span>
              Executes your code with real-time output.
            </li>
            <li>
              <span className="font-semibold text-blue-400">Code Assistant:</span>
              Debug, optimize or generate code.
            </li>
            <li>
              <span className="font-semibold text-purple-400">Explain Code:</span>
              Explains logic step-by-step.
            </li>
            <li>
              <span className="font-semibold text-gray-400">Related Programs:</span>
              Shows useful examples.
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

export default ActionView;
