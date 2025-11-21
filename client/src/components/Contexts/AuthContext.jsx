import { createContext, useContext, useEffect, useState } from "react";
import { Local } from "../../utils/storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // Load from localStorage on initial load
  const [user, setUser] = useState(() => {
    return Local.get("user") || null;  
  });

  // Sync user state with localStorage
  useEffect(() => {
    if (user) {
      Local.set("user", user);
    } else {
      Local.remove("user");
    }
  }, [user]);
  
  const logout = () => {
    setUser(null);
    Local.remove("user"); 
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
