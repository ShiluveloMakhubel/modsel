import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css';

const Login = ({ setUserId, setRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    axios.get(`http://ec2-13-50-45-196.eu-north-1.compute.amazonaws.com:8000/login?email=${email}&password=${password}`)
      .then(response => {
        if (response.data.exists) {
          setUserId(response.data.Userid);
          setRole(response.data.role); // Store role
          console.log('mrdr',response.data.role);
          navigate('/home');
        } else {
          setError(response.data.message);
        }
      })
      .catch(error => {
        console.error(error);
        setError('An error occurred. Please try again.');
      });
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Login</button>
        {error && <p className="error-msg">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
