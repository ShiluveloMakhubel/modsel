import IndexPage from './components/indexPage/indexPage';
import Login from './components/login/login';
import Signup from './components/signup/signup';
import Home from './components/home/home';
import Profile from './components/profile/profile';
import React from 'react';
import {BrowserRouter as Router,Route,Routes} from 'react-router-dom'
import './App.css';


 
function App  ( ){
  return (
    <Router>
            <Routes>
            <Route path='/' exact element={<IndexPage/>}/>
            <Route path='/login' exact element={<Login/>}/>
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path='*' element={<h1>Not Found</h1>}/>

            </Routes>
    </Router>
  );
};
export default App;
