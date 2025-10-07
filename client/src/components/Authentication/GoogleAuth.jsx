import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { API_URL} from "../../../config";

const GoogleAuth = ({ clientID , setMessage, navigate }) => {
  const handleSuccess = async (credentialResponse) => {
    const token = credentialResponse?.credential;

    if (!token) {
      setMessage({ text: "Google token missing!", type: "error" });
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/auth/google`,
        { credential: token },  
        { withCredentials: true }
      );
      const { user } = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      
      setMessage({ text: "🎉 Login Successful!", type: "success" });
      setTimeout(() => navigate("/"), 500);
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      setMessage({ text: "Google Login Failed", type: "error" });
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientID}>
      <div>
        <GoogleLogin
          onSuccess={handleSuccess}
          options={{ use_fedcm_for_prompt: false }}
          onError={() =>
            setMessage({ text: "Google Login Error", type: "error" })
          }
          useOneTap ={false}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
