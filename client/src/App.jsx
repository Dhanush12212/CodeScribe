import React, { useEffect } from 'react';
import { BrowserRouter as Router , Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import LandingPage from './pages/LandingPage'; 
import Home from './pages/Home'; 
 
function App() { 
    
return (
    <>
    <Router>
      <Routes> 
        <Route path='/' element={<LandingPage/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/CodeMesh/:roomId' element={<Home/>} />
      </Routes>
    </Router>

    </>
  )
}

export default App