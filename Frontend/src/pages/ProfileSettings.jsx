import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux'; // Or get user from localStorage if not using Redux

const ProfileSettings = () => {
  const user = JSON.parse(localStorage.getItem('user')); // Or use Redux
  const [form, setForm] = useState({
    fullName: '',
    department: '',
    profilePic: null,
    profilePicUrl: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`/api/users/${user._id}`).then(res => {
      setForm({
        fullName: res.data.fullName || '',
        department: res.data.department || '',
        profilePic: null,
        profilePicUrl: res.data.profilePic || '',
      });
    });
  }, [user._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm(prev => ({ ...prev, profilePic: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('fullName', form.fullName);
    formData.append('department', form.department);
    if (form.profilePic) {
      formData.append('profilePic', form.profilePic);
    }

    try {
      const res = await axios.put(`/api/users/${user._id}`, formData);
      setMessage('Profile updated successfully');
      localStorage.setItem('user', JSON.stringify(res.data)); // update local user
    } catch (err) {
      setMessage('Error updating profile');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-20 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      {message && <p className="mb-4 text-sm text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-4">
          <label className="block font-medium">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Department</label>
          <input
            type="text"
            name="department"
            value={form.department}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded p-2"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Profile Picture</label>
          <input type="file" name="profilePic" onChange={handleFileChange} />
          {form.profilePicUrl && (
            <img
              src={form.profilePicUrl}
              alt="Profile"
              className="w-20 h-20 mt-2 rounded-full object-cover"
            />
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;
