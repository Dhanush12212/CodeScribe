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
  const [shareLink, setShareLink] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [copied, setCopied] = useState(false); 
  const popupRef = useRef(null);

  const getRoomIdFromToken = async () => {
    try {
      const token = new URLSearchParams(window.location.search).get("token");
      if (!token) return null;

      const res = await axios.get(
        `${API_URL}/room/validateRoomAccess?token=${encodeURIComponent(token)}`,
        { withCredentials: true }
      );

      return res.data.roomId;
    } catch (err) { 
      return null;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowSharePopup(false);
      }
    };
    if (showSharePopup)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSharePopup]);

  const handleGenerateLink = async (requestedAccess) => {
    try {
      setLinkLoading(true);
      setShareLink("");
    
      const roomId = await getRoomIdFromToken();
      if (!roomId) {
        alert("Room ID could not be determined!");
        return;
      }
    
      if (requestedAccess === "write") {
        const currentUrl = window.location.href;
        setShareLink(currentUrl);
        return;
      }
    
      const res = await axios.post(
        `${API_URL}/room/generateLink`,
        { roomId, access: "read" },
        { withCredentials: true }
      );
    
      setShareLink(res.data.url);
    } catch (err) {
      console.error(err);
      alert("Failed to generate link");
    } finally {
      setLinkLoading(false);
    }
  };

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
        { withCredentials: true, responseType: "blob" }
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
        <div className={activeComponent === "CodeRunner" ? "block" : "hidden"}>
          <CodeRunner editorRef={editorRef} languageId={languageId} />
        </div>

        <div
          className={activeComponent === "Code Assisstant" ? "block" : "hidden"}
        >
          <CodeAssisstant />
        </div>

        <div className={activeComponent === "Room Chat" ? "block" : "hidden"}>
          <RoomChat />
        </div>

        <div className={activeComponent === "Code Review" ? "block" : "hidden"}>
          <CodeReview editorRef={editorRef} />
        </div>
      </div>

      {showSharePopup && (
        <div
          ref={popupRef}
          className="
            absolute top-[60px] right-3
            max-w-[380px]
            w-[90vw]
            sm:w-[60vw]
            md:w-[40vw]
            lg:w-[28vw]
            rounded-xl p-5 shadow-2xl z-30
          "
          style={{
            background: "rgba(25, 25, 25, 0.92)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(59,130,246,0.5)",
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-blue-400">
              {showShareInfo ? "Feature Information" : "Share Your Workspace"}
            </h3>

            <Info
              size={22}
              className="cursor-pointer text-yellow-400 hover:text-white transition"
              onClick={() => setShowShareInfo(!showShareInfo)}
            />
          </div>

          {showShareInfo ? (
            <div className="text-sm text-gray-300 space-y-3 leading-relaxed">
              <p>
                <span className="text-green-400 font-semibold">Run Code:</span>{" "}
                Execute instantly.
              </p>
              <p>
                <span className="text-blue-400 font-semibold">
                  AI Assistant:
                </span>{" "}
                Improve and debug code.
              </p>
              <p>
                <span className="text-indigo-400 font-semibold">Chat:</span>{" "}
                Collaborate live.
              </p>
              <p>
                <span className="text-purple-400 font-semibold">Review:</span>{" "}
                AI suggestions.
              </p>
              <p>
                <span className="text-green-400 font-semibold">PDF Export:</span>{" "}
                Save formatted output.
              </p>

              <button
                className="mt-4 w-full py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400"
                onClick={() => setShowShareInfo(false)}
              >
                Back
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <button
                className="w-[60%] py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg mb-4"
                onClick={() => setShowShareRoomOptions(true)}
              >
                Share Room
              </button>

              {showShareRoomOptions && (
                <div className="flex flex-col items-center gap-3 mb-4 w-full">
                  <div className="flex gap-3 w-full justify-center">
                    <button
                      className="w-[40%] py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                      onClick={() => handleGenerateLink("read")}
                    >
                      Read Only
                    </button>

                    <button
                      className="w-[40%] py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                      onClick={() => handleGenerateLink("write")}
                    >
                      Read / Write
                    </button>
                  </div>

                  {linkLoading ? (
                    <div className="text-blue-400 text-sm mt-2">
                      Generating link...
                    </div>
                  ) : (
                    shareLink && (
                      <div
                        className="w-full p-3 bg-black/40 rounded-lg mt-2 flex flex-col items-center"
                        style={{ border: "1px solid #4B5563" }}
                      >
                        <p className="text-xs text-gray-300 break-all text-center">
                          {shareLink ? `${shareLink.slice(0, 50)}...` : ""}
                        </p>

                        <div className="flex gap-4">
                          <button
                            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-md"
                            onClick={() => {
                              navigator.clipboard.writeText(shareLink);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 1500);
                            }}
                          >
                            Copy Link
                          </button>
                          <button
                            className="mt-2 px-4 py-1 bg-yellow-500 hover:bg-yellow-400 text-black text-sm rounded-md"
                            onClick={async () => {
                              if (navigator.share) {
                                try {
                                  await navigator.share({
                                    title: "Join my CodeScribe Room",
                                    text: "Here is your workspace link",
                                    url: shareLink,
                                  });
                                } catch (err) {
                                  console.log("Share failed:", err);
                                }
                              } else {
                                navigator.clipboard.writeText(shareLink);
                                alert(
                                  "Sharing not supported. Link copied instead."
                                );
                              }
                            }}
                          >
                            Share
                          </button>
                        </div>

                        {copied && (
                          <div className="mt-2 text-green-400 text-xs font-semibold">
                            ✓ Copied!
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              <button
                className={`w-[60%] py-3 rounded-lg text-white font-semibold ${
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
