"use client";

import { useState } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const handlePasswordSubmit = () => {
    if (
      password &&
      process.env.AUTH_PASSWORD &&
      password === process.env.AUTH_PASSWORD
    ) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password.");
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
          className="rounded-l-xl border border-gray-300 py-4 px-5"
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

  return <>{children}</>;
}
