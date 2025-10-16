import { Router } from 'express';
import { 
    loginUser, 
    registerUser, 
    logoutUser, 
    checkLog, 
    googleLogin,  
} from '../controller/auth.controller..js'
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.route('/login').post(loginUser);
router.route('/register').post(registerUser);
router.route('/logout').put(logoutUser);
router.route('/isLoggedIn').get(verifyJWT, checkLog);
router.route('/google').post(googleLogin); 

export default router;
