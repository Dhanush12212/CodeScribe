import React from "react";
import { Share2 } from "lucide-react";

const ActionButtons = ({ activeComponent, setActiveComponent, onShowSharePopup }) => {

  const buttonBaseStyle =
    "w-full py-3 rounded-md font-medium transition-all duration-200 cursor-pointer";

  const buttons = [
    { label: "Run Code", key: "CodeRunner", color: "#16a34a" },
    { label: "Code Assistant", key: "Code Assisstant", color: "#2563eb" },
    { label: "Room Chat", key: "Room Chat", color: "#6366F1" },
    { label: "Code Review", key: "Code Review", color: "#8b5cf6" },
  ];

  return (
    <div className="w-full"> 
      <div className="hidden sm:flex gap-3 w-full items-center mx-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          {buttons.map(({ label, key, color }) => (
            <button
              key={key}
              onClick={() => setActiveComponent(key)}
              className={buttonBaseStyle}
              style={{
                backgroundColor: activeComponent === key ? color : "transparent",
                color: activeComponent === key ? "#ffffff" : color,
                border: `1px solid ${color}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={onShowSharePopup}
          className="p-2 rounded-full hover:bg-blue-500 hover:text-white transition-all"
          style={{
            border: "1px solid #3b82f6",
            color: "#60a5fa",
          }}
          title="Share"
        >
          <Share2 size={22} />
        </button>
      </div> 

      <div className="sm:hidden flex flex-col gap-3 w-full px-3 mt-1">
        <div className="grid grid-cols-2 gap-3">
          {buttons.map(({ label, key, color }) => (
            <button
              key={key}
              onClick={() => setActiveComponent(key)}
              className={buttonBaseStyle}
              style={{
                backgroundColor: activeComponent === key ? color : "transparent",
                color: activeComponent === key ? "#ffffff" : color,
                border: `1px solid ${color}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex justify-center w-full">
          <button
            onClick={onShowSharePopup}
            className="p-3 rounded-full hover:bg-blue-500 hover:text-white transition-all"
            style={{
              border: "1px solid #3b82f6",
              color: "#60a5fa",
            }}
            title="Share"
          >
            <Share2 size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;
