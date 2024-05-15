// LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css'; // Make sure to create a corresponding CSS file for styling
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  let navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login credentials:', email, password);
    // Here you would add your logic to handle the login (e.g., API call)

    axios.get("http://localhost:8000/getAllBooks")
  .then(response => {
    const items = response.data.Items;
    items.forEach(item => {
      if(item.Email==email && item.password==password)
        {
          navigate('/home');
          
        }
        else
        {
          console.log('Wrong credentials')
        }
    });
  })
  .catch(error => {
    console.error(error);
  });
}




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
      </form>
    </div>
  );
};

export default Login;
