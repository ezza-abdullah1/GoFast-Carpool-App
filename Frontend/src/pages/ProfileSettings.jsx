import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUserDetails } from "../Components/Authentication/redux/userSlice";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const storedUser = JSON.parse(sessionStorage.getItem("user"));
  const [formData, setFormData] = useState({
    fullName: storedUser?.fullName || "",
    department: storedUser?.department || "",
    gender: storedUser?.gender || "",
    password: "",
  });

  const { userDetails } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClose = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"; // Default to localhost if undefined
      console.log("Sending PUT request to:", `${backendUrl}/api/auth/update-profile`);
      const { data } = await axios.put(
        `${backendUrl}/api/auth/update-profile/${userDetails.id}`,
        {
          fullName: formData.fullName,
          department: formData.department,
          gender: formData.gender,
          password: formData.password,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      
      // Update localStorage
      sessionStorage.setItem("user", JSON.stringify(data.updatedUser));
      
      // Update Redux state
      dispatch(setUserDetails(data.updatedUser));
      
      toast.success("Profile updated successfully");
      
      // Navigate to home after successful update
      navigate("/");
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

      <div className="max-w-md mx-auto mb-32 mt-32 p-6 bg-white shadow-md rounded-md dark:bg-gray-800 dark:text-white relative">
        <button
          className="absolute top-3 right-3 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
          onClick={handleClose}
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6">Update Profile Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Management">Management</option>
              <option value="Science and Humanities">Science and Humanities</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">New Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Update Profile"}
          </button>
        </form>
      </div>
    </>
  );
};

export default ProfileSettings;