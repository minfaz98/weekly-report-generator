import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (token) {
      try {
        setUser(jwtDecode(token));
      } catch {
        localStorage.clear();
      }
    }
  }, []);

 const login = (access, refresh, userData) => {
   localStorage.setItem("access", access);
   localStorage.setItem("refresh", refresh);

   setUser(userData);
 };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
