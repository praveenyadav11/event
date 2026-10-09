import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("eventflow_token");
    if (token) {
      api
        .get("/auth/me")
        .then((res) => setUser({ ...res.data, id: res.data._id }))
        .catch(() => localStorage.removeItem("eventflow_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("eventflow_token", token);
    setUser({ ...userData, id: userData.id || userData._id });
  };

  const logout = () => {
    localStorage.removeItem("eventflow_token");
    setUser(null);
  };

  const updateUser = (data) => setUser((prev) => ({ ...prev, ...data }));

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
