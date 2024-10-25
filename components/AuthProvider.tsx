"use client";

import { createContext, useState, ReactNode } from "react";

export const AuthContext = createContext<{
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
}>({
  isAuthenticated: false,
  setAuthenticated: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
