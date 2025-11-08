import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CodeEditor from "../components/CodeEditor";
import { API_URL } from "../../config";

function RoomWorkspace() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);  
   
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${API_URL}/auth/isLoggedIn`, { withCredentials: true });
        setIsChecking(false);
      } catch (error) {
        navigate("/register");
      }
    };
    checkAuth();
  }, [navigate]); 
  if (isChecking) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f0a19] text-white text-xl">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0f0a19] text-gray-500 px-3 py-2">
      <CodeEditor roomId={roomId} />
    </div>
  );
}

export default RoomWorkspace;
