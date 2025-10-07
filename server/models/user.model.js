import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: true, 
        },
        profilePic: {
            type: String,
            default: "https://e7.pngegg.com/pngimages/419/473/png-clipart-computer-icons-user-profile-login-user-heroes-sphere-thumbnail.png"
        },
        googleId: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true
    }
);


export const User = mongoose.model("User", userSchema);