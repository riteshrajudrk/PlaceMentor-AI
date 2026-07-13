import { createContext, useCallback, useContext, useEffect, useState } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user on refresh
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await API.get("/auth/me");
        setUser(data);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const register = async (name, email, password, targetCompany) => {
    const { data } = await API.post("/auth/register", {
      name,
      email,
      password,
      targetCompany
    });
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => ({
      ...prev,
      ...updatedData
    }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
