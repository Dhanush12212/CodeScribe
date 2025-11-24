import React, { useState, useEffect, useRef } from "react";
import { Info } from "lucide-react";
import CodeRunner from "../components/Actions/CodeRunner";
import CodeAssisstant from "../components/Actions/CodeAssisstant";
import RoomChat from "../components/Actions/RoomChat";
import CodeReview from "../components/Actions/CodeReview";
import ActionButtons from "../components/UI/ActionButtons";
import { API_URL } from "../../config";
import axios from "axios";

const ActionView = ({ editorRef, languageId, language }) => {
  const [activeComponent, setActiveComponent] = useState("CodeRunner");
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showShareRoomOptions, setShowShareRoomOptions] = useState(false);
  const [showShareInfo, setShowShareInfo] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowSharePopup(false);
      }
    };
    if (showSharePopup)
      document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [showSharePopup]);
 

  const handleDownloadPDF = async () => {
    try { 
      setShowSharePopup(false);

      const code = editorRef.current?.getValue();
      if (!code) return alert("No code available to export!");

      setIsDownloading(true);
 
      const lang =
        editorRef.current?.getModel()?.getLanguageId() ||
        language ||
        "plaintext";

      const response = await axios.post(
        `${API_URL}/export/pdf`,
        { code, language: lang },
        {
          withCredentials: true,
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `CodeScribe Code.pdf`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col w-full mt-2 relative"> 
      {isDownloading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-50 text-white rounded-lg">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          <span className="mt-3 text-lg">Generating PDF...</span>
        </div>
      )}

      <ActionButtons
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
        onShowSharePopup={() => {
          setShowSharePopup(true);
          setShowShareRoomOptions(false);
          setShowShareInfo(false);
        }}
      />
 
      <div className="flex-1 overflow-y-auto rounded-md bg-[#0f0f0f] p-2 relative">
        {activeComponent === "CodeRunner" && (
          <CodeRunner editorRef={editorRef} languageId={languageId} />
        )}
        {activeComponent === "Code Assisstant" && <CodeAssisstant />}
        {activeComponent === "Room Chat" && <RoomChat />}
        {activeComponent === "Code Review" && (
          <CodeReview editorRef={editorRef} />
        )}
      </div>
 
      {showSharePopup && (
        <div
          ref={popupRef}
          className="
            absolute top-[60px] right-3
            max-w-[90vw] sm:max-w-[320px] md:max-w-[380px]
            w-[80vw] sm:w-[28vw]
            rounded-xl p-5 shadow-2xl z-30
            transition-all duration-200
          "
          style={{
            background: "rgba(25, 25, 25, 0.92)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(59, 130, 246, 0.5)",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-blue-400">
              {showShareInfo ? "Feature Information" : "Share Options"}
            </h3>

            <Info
              size={22}
              className="cursor-pointer text-yellow-400 hover:text-white transition"
              onClick={() => setShowShareInfo(!showShareInfo)}
            />
          </div>

          {/* INFO */}
          {showShareInfo ? (
            <div className="text-sm text-gray-300 space-y-3 leading-relaxed">
              <p>
                <span className="text-green-400 font-semibold">Run Code:</span>{" "}
                Execute your code instantly.
              </p>
              <p>
                <span className="text-blue-400 font-semibold">
                  Code Assistant:
                </span>{" "}
                Debug & optimize your code.
              </p>
              <p>
                <span className="text-indigo-400 font-semibold">
                  Room Chat:
                </span>{" "}
                Collaborate with others live.
              </p>
              <p>
                <span className="text-purple-400 font-semibold">
                  Code Review:
                </span>{" "}
                AI suggests improvements.
              </p>
              <p>
                <span className="text-green-400 font-semibold">
                  Download PDF:
                </span>{" "}
                Export formatted code.
              </p>

              <button
                className="mt-4 w-full py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition"
                onClick={() => setShowShareInfo(false)}
              >
                Back
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <button
                className="w-[60%] py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition mb-4"
                onClick={() => setShowShareRoomOptions(true)}
              >
                Share Room
              </button>

              {showShareRoomOptions && (
                <div className="flex gap-3 mb-4 w-full justify-center">
                  <button className="w-[40%] py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition">
                    Read Only
                  </button>

                  <button className="w-[40%] py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition">
                    Read / Write
                  </button>
                </div>
              )}

              {/* DOWNLOAD PDF BUTTON */}
              <button
                className={`w-[60%] py-3 rounded-lg transition text-white font-semibold
                  ${
                    isDownloading
                      ? "bg-gray-500 cursor-wait opacity-70"
                      : "bg-green-600 hover:bg-green-500"
                  }`}
                disabled={isDownloading}
                onClick={handleDownloadPDF}
              >
                {isDownloading ? "Generating..." : "Download as PDF"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionView;
