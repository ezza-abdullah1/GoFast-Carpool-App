import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Mail, User, Lock } from 'lucide-react';
import axios from 'axios';

const SignUp = ({ onSwitchToSignIn, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    department: '',
    email: '',
    password: '',
    gender: '' 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate form fields
    if (formData.fullName.length < 7) {
      toast.error("Full Name must be at least 7 characters long.");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", formData);
      toast.success("Account created successfully! Please log in.");
      onClose(); // Optionally close modal
    } catch (error) {
      toast.error(error.response?.data?.error || "Signup failed. Try again.");
    }
  };

  const handleSwitchToSignIn = (e) => {
    e.preventDefault();
    onSwitchToSignIn();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 dark:bg-gray-800 dark:text-white">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">Create Account</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="fullName" className="block mb-2 font-medium">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <User size={20} />
              </div>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Your full name"
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.fullName}
                onChange={handleChange}
                required
                minLength={7}
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="department" className="block mb-2 font-medium">Department</label>
            <div className="relative">
              <select
                id="department"
                name="department"
                className="w-full px-3 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select your Department</option>
                <option value="cs">CS</option>
                <option value="eng">EE</option>
                <option value="business">Management</option>
                <option value="civil">Civil</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>

          {/* Gender field */}
          <div className="mb-4">
            <label htmlFor="gender" className="block mb-2 font-medium">Gender</label>
            <div className="relative">
              <select
                id="gender"
                name="gender"
                className="w-full px-3 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 font-medium">University Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <Mail size={20} />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="e.g. l217654e@lhr.nu.edu.pk"
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Must be a valid FAST NUCES email ending with @lhr.nu.edu.pk</p>
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 font-medium">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Create a strong password"
                className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Password must be at least 8 characters long</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Account
          </button>

          <div className="mt-4 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Already have an account? 
              <button 
                type="button"
                className="text-blue-500 ml-1 font-medium hover:underline"
                onClick={handleSwitchToSignIn}
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
