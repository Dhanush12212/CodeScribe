import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/User.js';  

//Registering an user 
export const Register = async (req, res) => {
    let { username, email, password } = req.body;

    try {
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await userModel.create({
            username,
            email,
            password: hashedPassword,
        });

        // Generate JWT token
        const token = jwt.sign(
            { email: newUser.email, id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Securely set the cookie
        res.cookie("token", token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", 
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        });

        // Exclude password before sending response
        const { password: _, ...userWithoutPassword } = newUser._doc;

        return res.status(201).json({ message: "Successfully Registered", user: userWithoutPassword });
    }   
    catch (error) {
        console.error("Error in Register route:", error);
        return res.status(500).json({ message: "Something went wrong!", error: error.message });
    }
};


//Login Authorization
export const Login = async (req, res) => {
    let { email, password } = req.body;

    try {
        const existingUser = await userModel.findOne({ email });

        if (!existingUser) {
            return res.status(400).json({ message: "No User Found!!" });
        } 

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password!" });
        }
 
        let token = jwt.sign(
            { email: existingUser.email, id: existingUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", 
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        });
        return res.status(200).json({ message: "Login Successfully", existingUser });
        
    } catch (error) {
        console.error("Error in Login route:", error);
        return res.status(500).json({ message: "Internal Server Error", error:error.message });
    }
};

//Logout
export const Logout = async (req, res) => { 
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        expires: new Date(0), // Expire the cookie
      });
      res.clearCookie("token"); 
    return res.status(200).json({ message: "Logout successful" });
};

 