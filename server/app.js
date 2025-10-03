import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express'; 
import AuthRoute from './routes/AuthRoute.js';
import EditorRoute from './routes/CodeEditorRoute.js';
import cookieParser from 'cookie-parser';
import connectDB from './db/connectDB.js';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io'; 

const app = express();
const PORT = process.env.PORT || 8000;

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:5173','https://code-mesh.vercel.app'],
        credentials: true,
    }
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:[ 'http://localhost:5173','https://code-mesh.vercel.app'],
    credentials: true,
}));


app.use('/api/Auth', AuthRoute);
app.use('/api/Code', EditorRoute);
 
const rooms = new Map(); 

// Socket Connection Handling
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        
        if (!rooms.has(roomId)) {
            rooms.set(roomId, { code: '', language: 'javascript' });
        }

        const { code, language } = rooms.get(roomId);

        console.log(`User ${socket.id} joined room: ${roomId}`);
        io.to(socket.id).emit('roomJoined', { roomId, message: `Joined room: ${roomId}` });
        io.to(socket.id).emit('updatedCode', { roomId, code });
        io.to(socket.id).emit('languageChange', { roomId, language });
    });

    // Listen for language change
    socket.on('languageChange', ({ roomId, selectedLanguage }) => {
        if (rooms.has(roomId)) {
            rooms.get(roomId).language = selectedLanguage;
            io.to(roomId).emit('languageChange', { roomId, language: selectedLanguage });
        }
    });

    // Listen for code updates
    socket.on('updatedCode', ({ roomId, newCode }) => {
        if (rooms.has(roomId)) {
            rooms.get(roomId).code = newCode;
            socket.to(roomId).emit('updatedCode', { roomId, code: newCode });
        }
    });

    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
    });
});

// Start Server
const startServer = async () => {
    try {
        await connectDB();
        httpServer.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error(`Server failed: ${error.message}`);
        process.exit(1);
    }
};

startServer();
