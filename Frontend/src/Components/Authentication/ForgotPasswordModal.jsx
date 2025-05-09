import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const ForgotPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/forgot-password", { email });
      toast.success("Password reset link sent to your email");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error sending reset link");
    }
  };

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your university email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
        <button onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default ForgotPasswordModal;
