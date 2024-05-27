import IndexPage from './components/indexPage/indexPage';
import Login from './components/login/login';
import Signup from './components/signup/signup';
import Homepage from './components/home/home';
import Profile from './components/profile/profile';
import React, { useState } from 'react';
import {BrowserRouter as Router,Route,Routes} from 'react-router-dom'
import './App.css';



 
function App  ( ){
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState(null);
  return (
    <Router>
            <Routes>
            <Route path='/' exact element={<IndexPage/>}/>
            <Route path="/login" element={<Login setUserId={setUserId}  setRole={setRole}/>} />
            <Route path="/home" element={<Homepage userId={userId} role={role}/>} />
            <Route path="/signup" element={<Signup setUserId={setUserId}/>} />
            <Route path="/profile" element={<Profile />} />
            <Route path='*' element={<h1>Not Found</h1>}/>

            </Routes>
    </Router>
  );
};
export default App;
