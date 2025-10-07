import { User } from '../models/user.model.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.utils.js'; 
import asyncHandler from '../utils/asyncHandler.utils.js';
import { OAuth2Client } from 'google-auth-library'; 
import sendTokenResponse from "../utils/authHelper.utils.js"; 

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = asyncHandler(async (req, res) => {
    let { username, password, email } = req.body;

    //validate user
    if( !username || !password || !email )
      throw new ApiError( 400, "All fields are required!" );

    const existingUser = await User.findOne({ email });
    if(existingUser)
      throw new ApiError( 400, "User already found!" );

    //Salting
    const salt = await bcrypt.genSalt(10);

    //Haisng the password
    const hashedPassword = await bcrypt.hash( password, salt);

    //Creating new User
    const newUser = await User.create({
        username,
        password: hashedPassword,
        email,
    })

    //Token Generation & Cookie Storage handled by helper
    return sendTokenResponse(newUser, 201, res, "Successfully Registered.");
});

//Login with JWT Token
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new ApiError(400, "All fields are required!");
  
  const existingUser = await User.findOne({ email });
  if (!existingUser)
    throw new ApiError(400, "No user found!");

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  if (!isPasswordValid)
    throw new ApiError(400, "Invalid Password!");
  
  return sendTokenResponse(existingUser, 200, res, "User Login Successfully");
});

//Auth for Logout
const logoutUser = async (req, res) => { 
  res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      expires: new Date(0),
      path: "/", 
    });
    res.clearCookie("token"); 
  return res.status(200).json({ message: "Logout successful" });
};

//Auth for checking the Log
const checkLog = asyncHandler( async(req, res, next) => {
  const accessToken = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if( !accessToken)
    throw new ApiError( 401,"Unauthorized request", ["Acccess token not found!"]);

  const decodedToken = jwt.verify( accessToken, process.env.JWT_SECRET);
  if( !decodedToken)
    throw new ApiError(401, "Invalid Token", ["Token verifiication failed"]);
 
  const user = await User.findById( decodedToken.id).select("-password");
  if( !user)
    throw new ApiError( 400, "User Not Login");

  req.user = user;
  next();
});
 

//Auth for Google Login
const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential)
    throw new ApiError(400, "Google token missing");

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload(); 
  const { email, name, picture, sub: googleId } = payload;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      username: name,
      email,
      googleId,
      profilePic: picture,
      password: null,
    });
  } else if (!user.profilePic || user.profilePic !== picture) {
    user.profilePic = picture;
    await user.save();
  }
 
  return sendTokenResponse(user, 200, res, "Google Login Successful!");
});

export {
    registerUser,
    loginUser,
    logoutUser,
    checkLog, 
    googleLogin,
}
