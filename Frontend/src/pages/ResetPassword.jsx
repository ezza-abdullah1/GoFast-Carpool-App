import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/auth/reset-password/${token}`, { password });
      toast.success("Password reset successful");
      navigate("/signin");
    } catch (err) {
      toast.error(err.response?.data?.error || "Error resetting password");
    }
  };

  return (
    <div className="reset-password">
      <form onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
