import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User } from '../api/client';
import { langs, Lang } from '../i18n';

interface AuthContextType {
  user: User | null;
  token: string | null;
  lang: Lang;
  t: typeof langs.en;
  setLang: (l: Lang) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [lang, setLang] = useState<Lang>((localStorage.getItem('lang') as Lang) || 'en');
  const [loading, setLoading] = useState(true);

  const t = langs[lang];

  useEffect(() => {
    if (token) {
      api.auth.me().then(setUser).catch(() => { localStorage.removeItem('token'); setToken(null); }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
    const res = await api.auth.register(data);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const handleSetLang = (l: Lang) => { setLang(l); localStorage.setItem('lang', l); };

  return (
    <AuthContext.Provider value={{ user, token, lang, t, setLang: handleSetLang, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
