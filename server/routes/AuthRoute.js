import express from 'express';
import {Login, Register, Logout } from '../controller/AuthController.js'
import authMiddleWare from '../middleware/AuthMiddleware.js'

const router = express.Router()

router.post('/login', Login);
router.post('/register', Register);
router.put('/logout', Logout); 

router.get('/loginStatus', authMiddleWare, (req, res) => {
    return res.json({ isAuthenticated: true, user: req.user });
}); 
 
export default router;