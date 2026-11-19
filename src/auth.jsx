import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken, setUnauthorizedHandler } from './api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [ready, setReady] = useState(!getToken());

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const startSession = ({ accessToken, user }) => {
    setToken(accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  useEffect(() => {
    setUnauthorizedHandler(logout); // expired/invalid token -> back to login
    if (!getToken()) return;
    api.me().then((me) => setUser((u) => ({ ...u, ...me }))).catch(() => {}).finally(() => setReady(true));
  }, [logout]);

  if (!ready) return <div className="center muted">Loading…</div>;
  return <Ctx.Provider value={{ user, startSession, logout }}>{children}</Ctx.Provider>;
}
