"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: 'user' | 'partner' | 'admin';
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  login: (userData: any, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập khi app khởi động
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
      console.log("Restored login state:", { token: savedToken, user: JSON.parse(savedUser) });
    }
  }, []);

  const login = (userData: any, userToken: string) => {
    console.log("Login called with:", { userData, userToken });
    
    setIsLoggedIn(true);
    setUser(userData);
    setToken(userToken);
    
    // Lưu vào localStorage
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    console.log("Logout called");
    
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    
    // Xóa khỏi localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
