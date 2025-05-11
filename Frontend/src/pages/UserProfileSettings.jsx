import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../redux/authSlice'; // Ensure this action updates the store
import axios from 'axios';

const UserProfileSettings = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const [previewUrl, setPreviewUrl] = useState(currentUser?.profilePicture || '');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    setPreviewUrl(currentUser?.profilePicture || '');
  }, [currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      // 🔁 Replace this with actual upload logic or API endpoint
      const formData = new FormData();
      formData.append('profilePicture', selectedFile);

      const response = await axios.post('/api/user/uploadProfilePicture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updatedUser = {
        ...currentUser,
        profilePicture: response.data.profilePictureUrl, // ← expected URL from backend
      };

      // 🔄 Update Redux store
      dispatch(updateUser(updatedUser));

      // 💾 Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      alert('Profile picture updated!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload profile picture.');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Update Profile Picture</h2>

      <div className="flex items-center gap-4">
        <img
          src={previewUrl || '/default-avatar.png'}
          alt="Profile Preview"
          className="w-20 h-20 rounded-full object-cover"
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <button
        onClick={handleUpload}
        disabled={!selectedFile}
        className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
      >
        Upload
      </button>
    </div>
  );
};

export default UserProfileSettings;
