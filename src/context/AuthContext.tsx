'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  jobTitle?: string;
  department?: string;
  profilePicture?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: { token: string; user: User }) => void;
  logout: () => void;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem('utask_token');
    const storedUser = window.localStorage.getItem('utask_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const persistUser = (nextUser: User | null) => {
    setUser(nextUser);
    if (nextUser) {
      window.localStorage.setItem('utask_user', JSON.stringify(nextUser));
    } else {
      window.localStorage.removeItem('utask_user');
    }
  };

  const handleLogin = ({ token: newToken, user: newUser }: { token: string; user: User }) => {
    setToken(newToken);
    window.localStorage.setItem('utask_token', newToken);
    persistUser(newUser);
  };

  const logout = () => {
    setToken(null);
    persistUser(null);
    window.localStorage.removeItem('utask_token');
  };

  const updateUser = (updatedUser: User) => {
    persistUser(updatedUser);
  };

  const value = useMemo(
    () => ({ user, token, login: handleLogin, logout, loading, updateUser }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
