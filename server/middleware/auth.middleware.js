import asyncHandler from '../utils/asyncHandler.utils.js';
import ApiError from '../utils/ApiError.utils.js'; 
import jwt from 'jsonwebtoken';

const verifyJWT = asyncHandler( async(req, res, next) => { 
        const accessToken = req.cookies?.token || req.headers.authorization?.split(" ")[1];
        if(!accessToken) 
            throw new ApiError( 401,"Unauthorized request", ["Acccess token not found!"]);

        try {
            let decodedToken = jwt.verify( accessToken, process.env.JWT_SECRET);    
            req.user = decodedToken; 
            next();
        } catch(error) {
            throw new ApiError(401, "Invalid Token", [ error.message || "Token verifiication failed"]);
        }
});

export {verifyJWT}