"use client";

import { useState, useContext } from "react";
import { AuthContext } from "./AuthProvider";

export default function PasswordPrompt() {
  const [password, setPassword] = useState("");
  const { setAuthenticated } = useContext(AuthContext);

  const handlePasswordSubmit = () => {
    if (password === process.env.NEXT_PUBLIC_TRELLO_TOKEN) {
      setAuthenticated(true);
    } else {
      alert("Incorrect password.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <h2>Please enter the password</h2>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        style={{ marginBottom: "1rem", padding: "0.5rem", fontSize: "1rem" }}
      />
      <button
        onClick={handlePasswordSubmit}
        style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}
      >
        Submit
      </button>
    </div>
  );
}
