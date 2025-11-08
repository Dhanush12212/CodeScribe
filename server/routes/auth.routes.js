import { Router } from 'express';
import { 
    loginUser, 
    registerUser, 
    logoutUser, 
    checkLog, 
    googleLogin,  
} from '../controller/auth.controller..js' 

const router = Router();

router.route('/login').post(loginUser);
router.route('/register').post(registerUser);
router.route('/logout').put(logoutUser);
router.route('/google').post(googleLogin); 

router.route('/isLoggedIn').get(checkLog, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "User is logged in",
    user: req.user,
  });
});

export default router;
