import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import API from "../api/axios";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Quick verification check against expiration time
        if (decoded.exp * 1000 > Date.now()) {
          // Sync with local Storage user profiles
          const storedUser = localStorage.getItem("user_profile");
          if (storedUser) setUser(JSON.parse(storedUser));
        } else {
          logout();
        }
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await API.post("/login/", { username, password });
    const { access, refresh, user: userProfile } = response.data;

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("user_profile", JSON.stringify(userProfile));

    setUser(userProfile);
    return userProfile;
  };

  const register = async (userData) => {
    await API.post("/register/", userData);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_profile");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
