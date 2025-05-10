import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ResetPassword ()  {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
        password,
        confirmPassword,
      });
      setMessage(res.data.message);
      setError("");
    } catch (err) {
      setMessage("");
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div>
      <h2>Reset Your Password</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleReset}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};