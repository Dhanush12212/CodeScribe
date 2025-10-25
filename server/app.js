import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';

import AuthRoute from './routes/auth.routes.js';
import CodeRunnerRoute from './routes/codeRunner.route.js';
import connectDB from './db/connectDB.js'; 
import initSocket from './socket/socket.js';

const app = express();
const PORT = process.env.PORT || 8000;
 
const httpServer = http.createServer(app);
 
initSocket(httpServer);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'https://code-mesh.vercel.app'],
    credentials: true,
}));

// Routes
app.use('/api/v1/auth', AuthRoute);
app.use('/api/v1/execute', CodeRunnerRoute);

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
