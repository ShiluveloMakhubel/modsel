import React, { useState } from 'react';
import './profile.css'; 

const ProfilePage = () => {
  // State for user profile information
  const [profile, setProfile] = useState({
    fullName: "John Doe",
    email: "johndoe@example.com",
    studentId: "123456789",
    contactInfo: "123 Main St, Anytown, USA",
    phoneNumber: "555-1234",
    language: "English",
    privacy: "Private"
  });

  // Function to handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img src="/path/to/profile-picture.jpg" alt="Profile" className="profile-pic"/>
        <h1>{profile.fullName}</h1>
        <h2>{profile.studentId}</h2>
      </div>
      <h2>Basic Information</h2>
      <form className="basic-info">
        <label>
          Full Name:
          <input type="text" name="fullName" value={profile.fullName} onChange={handleChange} />
        </label>
        <label>
          Email Address:
          <input type="email" name="email" value={profile.email} onChange={handleChange} />
        </label>
        <label>
          Student ID:
          <input type="text" name="studentId" value={profile.studentId} onChange={handleChange} />
        </label>
        <label>
          Contact Information:
          <input type="text" name="contactInfo" value={profile.contactInfo} onChange={handleChange} />
        </label>
        <label>
          Phone Number:
          <input type="tel" name="phoneNumber" value={profile.phoneNumber} onChange={handleChange} />
        </label>
      </form>
      <h2>Settings</h2>
      <form className="settings">
        <label>
          Language:
          <select name="language" value={profile.language} onChange={handleChange}>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </select>
        </label>
        <label>
          Privacy Settings:s
          <select name="privacy" value={profile.privacy} onChange={handleChange}>
            <option value="Public">Public</option>
            <option value="Private">Private</option>
          </select>
        </label>
      </form>
    </div>
  );
};

export default ProfilePage;
