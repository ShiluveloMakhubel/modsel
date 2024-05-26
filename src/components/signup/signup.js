import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './signup.css'; // Assuming you'll create a corresponding CSS file
import axios from 'axios';

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special symbol (!@#$%^&*) and be at least 8 characters long.');
      return;
    }
  
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format.');
      return;
    }
  
    axios.get("http://localhost:8000/getAllAccounts")
      .then(response => {
        const items = response.data.Items;
        // Check if any item has the same email
        const emailExists = items.some(item => item.Email === formData.email);
        if (emailExists) {
          setError('Email already exists. Please use a different email.');
        } else {
          // Proceed with signup if email doesn't exist
          axios.post("http://localhost:8000/submitdata", formData)
            .then(response => {
              console.log(response.data);
              navigate('/home'); // Navigate to homepage on successful signup
            })
            .catch(error => {
              console.error(error);
              setError('Signup failed. Please try again.'); // Set error message
            });
        }
      })
      .catch(error => {
        console.error(error);
        setError('Error checking email availability. Please try again.');
      });
  };
  
  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="submit-btn">Sign Up</button>
        {error && <p className="error-msg">{error}</p>} {/* Display error message */}
      </form>
    </div>
  );
}

export default Signup;
