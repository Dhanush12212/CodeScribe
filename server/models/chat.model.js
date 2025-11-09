import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    roomId: { 
        type: String, 
        required: true, 
        index: true 
    },
    senderId: 
    { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    senderName: { 
        type: String,
        required: true 
    },
    text: { 
        type: String 
    },
    // attachments: [{ 
    //     url: String,
    //     filename: String,
    //     mimeType: String 
    // }],
    status: { 
        type: String,
        enum: ["sent", "delivered", "read"], 
        default: "sent" },
        createdAt: { 
            type: Date,
            default: Date.now, 
            index: true 
        },
    }
);

MessageSchema.index({ roomId: 1, createdAt: -1 });

export const Message = mongoose.model("Message", MessageSchema);
