import './indexPage.css';
import { useNavigate } from 'react-router-dom';
import React from 'react';

const IndexPage = () => {
  let navigate = useNavigate();

  const handleSignup = () => {
    console.log('Redirect to signup page');
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div>
      <div className="animation-container">
         <h1>Welcome to Module Selector App</h1>
      </div>
     
      <p>Login if you already have an account, otherwise create a new account.</p>
      <div>
        <div className="button-container">
          <button onClick={handleLogin} className="button">Login</button>
        </div>
        <div className="button-container">
          <button onClick={handleSignup} className="button">Signup</button>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
