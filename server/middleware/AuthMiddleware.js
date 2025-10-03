import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    try {
        console.log("Incoming Request Headers:", req.headers);
        console.log("Incoming Cookies:", req.cookies);

        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);  
        req.user = decoded;
        console.log("Decoded User:", decoded); 
        
        next();
    } catch (error) {
        console.error("Token validation failed:", error.message);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

export default authMiddleware;
