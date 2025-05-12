import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import Header from "../Components/layout/Header"; // Adjust path as needed
import Footer from "../Components/layout/Footer"; // Adjust path as needed

const ProfileSettings = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [formData, setFormData] = useState({
    fullName: storedUser?.fullName || "",
    department: storedUser?.department || "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"; // Default to localhost if undefined
console.log("Sending PUT request to:", `${backendUrl}/api/auth/update-profile`);
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/update-profile`,
        {
          fullName: formData.fullName,
          department: formData.department,
          password: formData.password,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      localStorage.setItem("user", JSON.stringify(data.updatedUser));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="max-w-md mx-auto mt-32 p-6 bg-white shadow-md rounded-md dark:bg-black dark:text-white">
        <h2 className="text-2xl font-bold mb-6">Update Profile Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">New Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 px-4 rounded flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Update Profile"}
          </button>
        </form>
      </div>

    </>
  );
};

export default ProfileSettings;
