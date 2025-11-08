import React, { useEffect } from 'react';
import { BrowserRouter as Router , Routes, Route } from 'react-router-dom';
import LoginPage from './components/Authentication/LoginPage';
import RegisterPage from './components/Authentication/RegisterPage'; 
import RoomWorkspace from './pages/RoomWorkspace'; 
import RoomAccess from './pages/RoomAccess';
import LandingPage from './pages/LandingPage'
 
function App() { 
    
return (
    <>
    <Router>
      <Routes> 
        <Route path='/' element={<LandingPage/>} />
        <Route path='/room' element={<RoomAccess/>} />
        <Route path='/login' element={<LoginPage/>} />   
        <Route path='/register' element={<RegisterPage/>} /> 
        <Route path='/CodeScribe/:roomId' element={<RoomWorkspace/>} />
      </Routes>
    </Router>

    </>
  )
}

export default App