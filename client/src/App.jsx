import React, { useEffect } from 'react';
import { BrowserRouter as Router , Routes, Route } from 'react-router-dom';
import LoginPage from './components/Authentication/LoginPage';
import RegisterPage from './components/Authentication/RegisterPage';
import LandingPage from './pages/LandingPage'; 
import Home from './pages/Home'; 
 
function App() { 
    
return (
    <>
    <Router>
      <Routes> 
        <Route path='/' element={<LandingPage/>} />
        <Route path='/login' element={<LoginPage/>} />   
        <Route path='/register' element={<RegisterPage/>} /> 
        <Route path='/CodeMesh/:roomId' element={<Home/>} />
      </Routes>
    </Router>

    </>
  )
}

export default App