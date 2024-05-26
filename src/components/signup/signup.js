import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './signup.css'; // Assuming you'll create a corresponding CSS file
import axios from 'axios';

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    pin: ''
  });
  const [error, setError] = useState('');
  const [pinSent, setPinSent] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSendPin = () => {
    axios.post('http://localhost:8000/send_pin', { email: formData.email })
      .then(response => {
        console.log(response.data.message);
        setPinSent(true);
      })
      .catch(error => {
        console.error(error);
        setError('An error occurred. Please try again.');
      });
  };

  const handleVerifyPin = () => {
    axios.post('http://localhost:8000/verify_pin', { email: formData.email, pin: formData.pin })
      .then(response => {
        if (response.data.verified) {
          setPinVerified(true);
        } else {
          setError('Invalid PIN. Please try again.');
        }
      })
      .catch(error => {
        console.error(error);
        setError('An error occurred. Please try again.');
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!pinVerified) {
      setError('Please verify your PIN first.');
      return;
    }

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

    axios.post("http://localhost:8000/submitdata", formData)
      .then(response => {
        console.log(response.data);
        navigate('/login'); // Navigate to homepage on successful signup
      })
      .catch(error => {
        console.error(error);
        setError('Signup failed. Please try again.'); // Set error message
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
          <button type="button" onClick={handleSendPin} disabled={pinSent}>Send PIN</button>
        </div>
        {pinSent && !pinVerified && (
          <div className="input-group">
            <label htmlFor="pin">Enter PIN</label>
            <input type="text" id="pin" name="pin" value={formData.pin} onChange={handleChange} required />
            <button type="button" onClick={handleVerifyPin}>Verify PIN</button>
          </div>
        )}
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="submit-btn" disabled={!pinVerified}>Sign Up</button>
        {error && <p className="error-msg">{error}</p>} {/* Display error message */}
      </form>
    </div>
  );
}

export default Signup;
