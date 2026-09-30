import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getCurrentUser,
  login as authLogin,
  register as authRegister,
  logout as authLogout,
} from "../lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    // Fake ~400ms delay for pixel loading state
    await new Promise((r) => setTimeout(r, 400));
    const result = authLogin(email, password);
    if (result.ok) setUser(result.user);
    return result;
  }, []);

  const register = useCallback(async (username, email, password, confirmPassword) => {
    await new Promise((r) => setTimeout(r, 400));
    const result = authRegister(username, email, password, confirmPassword);
    if (result.ok) setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
