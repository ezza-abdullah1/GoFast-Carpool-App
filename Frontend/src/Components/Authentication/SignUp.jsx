import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import VerifyAccount from "./VerifyAccount";
import { Loader2 } from "lucide-react"; 

const SignUp = ({ onClose, onSwitchToSignIn }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    department: "",
    email: "",
    password: "",
    gender: "",
  });

  const [showVerify, setShowVerify] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState("");
  const [loading, setLoading] = useState(false); 

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, gender } = formData;

    if (!email.endsWith("@lhr.nu.edu.pk")) {
      toast.error("Only FAST NUCES Lahore emails are allowed.");
      return;
    }

    if (!["male", "female", "other"].includes(gender.toLowerCase())) {
      toast.error("Please select a valid gender.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/signup", formData);
      toast.success("Verification code sent to your email.");
      setEmailForVerification(formData.email);
      setShowVerify(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-md w-[400px]">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-2 border rounded-md mb-3"
            required
          />
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full p-2 border rounded-md mb-3"
            required
          >
            <option value="">Select Department</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Civil">Civil </option>
            <option value="Management">Management</option>
          </select>

          <input
            type="email"
            name="email"
            placeholder="FAST Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded-md mb-3"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded-md mb-3"
            required
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-2 border rounded-md mb-4"
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Sending Email...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <span
            onClick={onSwitchToSignIn}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Sign In
          </span>
        </p>
      </div>

      {showVerify && (
        <VerifyAccount
          email={emailForVerification}
          onSuccess={() => {
            setShowVerify(false);
            onSwitchToSignIn();
            onClose();
          }}
        />
      )}
    </div>
  );
};

export default SignUp;
