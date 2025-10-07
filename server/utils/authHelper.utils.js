import jwt from "jsonwebtoken"; 
import ApiResponse from "./ApiResponse.utils.js";

const sendTokenResponse = (user, statusCode, res, message) => {
  const token = jwt.sign(
    { email: user.email, id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  });

  const { password, ...userWithoutPassword } = user._doc;

  return res.status(statusCode).send(
    new ApiResponse(statusCode, { user: userWithoutPassword }, message)
  );
};

export default sendTokenResponse;