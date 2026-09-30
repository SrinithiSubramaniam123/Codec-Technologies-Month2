import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';
const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('kiln_token')) return setReady(true);
    api('/auth/me').then((d) => setUser(d.user)).catch(() => localStorage.removeItem('kiln_token')).finally(() => setReady(true));
  }, []);
  const finish = (d) => { localStorage.setItem('kiln_token', d.token); setUser(d.user); return d.user; };
  const login = async (email, password) => finish(await api('/auth/login', { method: 'POST', body: { email, password } }));
  const register = async (name, email, password) => finish(await api('/auth/register', { method: 'POST', body: { name, email, password } }));
  const logout = () => { localStorage.removeItem('kiln_token'); setUser(null); };
  return <Ctx.Provider value={{ user, ready, login, register, logout }}>{children}</Ctx.Provider>;
}
