import { createContext, useContext, useEffect, useState } from "react";
import { adminApi } from "../api/admin";
import { TOKEN_KEY } from "../api/http";
import { notify } from "../components/ui/notify";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    adminApi.me().then(setUser).catch(() => localStorage.removeItem(TOKEN_KEY)).finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const expired = () => {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      notify.error("Session expired. Please login again.");
    };
    window.addEventListener("admin-unauthorized", expired);
    return () => window.removeEventListener("admin-unauthorized", expired);
  }, []);

  const login = async (email, password) => {
    const r = await adminApi.login({ email, password });
    localStorage.setItem(TOKEN_KEY, r.token);
    setUser(r.user);
  };
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, ready, login, logout }}>{children}</Ctx.Provider>;
}
