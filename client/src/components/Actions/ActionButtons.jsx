import React from "react";
import { Info } from "lucide-react";

const ActionButtons = ({ activeComponent, setActiveComponent, onRunClick, onShowInfo }) => {
  const buttonBaseStyle =
    "w-full py-3 rounded-md font-medium transition-all duration-200";

  const buttons = [
    { label: "Run Code", key: "CodeRunner", color: "#16a34a" },
    { label: "Code Assistant", key: "Code Assisstant", color: "#2563eb" },
    { label: "Explain Code", key: "Explain Code", color: "#7c3aed" },
    { label: "Related Programs", key: "Related Programs", color: "#4b5563" },
  ];

  return (
    <div className="flex gap-3 w-full items-center mx-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
        {buttons.map(({ label, key, color }) => (
          <button
            key={key}
            onClick={() =>
              key === "CodeRunner" ? onRunClick() : setActiveComponent(key)
            }
            className={buttonBaseStyle}
            style={{
              backgroundColor: activeComponent === key ? color : "transparent",
              color: activeComponent === key ? "#ffffff" : color,
              border: `1px solid ${color}`,
            }}
            onMouseEnter={(e) => {
              if (activeComponent !== key) {
                e.target.style.backgroundColor = color;
                e.target.style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              if (activeComponent !== key) {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = color;
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Info Icon */}
      <button
        onClick={onShowInfo}
        style={{ border: "1px solid #facc15" }}
        className="p-2 rounded-full text-yellow-400 hover:bg-yellow-500 hover:text-white transition-all duration-200"
        title="Feature Info"
      >
        <Info size={22} />
      </button>
    </div>
  );
};

export default ActionButtons;
