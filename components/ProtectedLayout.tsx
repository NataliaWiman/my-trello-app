"use client";

import { useState, useEffect } from "react";
import Logout from "./Logout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");

  const handlePasswordSubmit = async () => {
    try {
      const response = await fetch("/api/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        alert("Incorrect password.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      alert("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/check-auth");
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
      } catch (error) {
        console.error("An error occurred while checking auth status:", error);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      setIsAuthenticated(false);
    } catch (error) {
      console.error("An error occurred during logout:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="rounded-l-xl border border-gray-300 focus:border-gray-500 py-4 px-5 outline-none"
        />
        <button
          onClick={handlePasswordSubmit}
          className="bg-sky-600 hover:bg-sky-700 text-white rounded-r-xl py-4 px-5 border border-sky-600"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <>
      <div onClick={handleLogout}>
        <Logout />
      </div>
      {children}
    </>
  );
}
