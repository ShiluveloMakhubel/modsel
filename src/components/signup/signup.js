import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './signup.css'; // Assuming you'll create a corresponding CSS file

function Signup() {
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: '',
  });

  let navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here, implement your logic to handle user registration
    // For example, post to your backend server

    console.log(user); // For demonstration, log the user object to the console

    // On successful signup, navigate to another route/page
    // navigate('/dashboard'); // Uncomment and set to your desired route on success
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" value={user.username} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" value={user.email} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" value={user.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="submit-btn">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;
