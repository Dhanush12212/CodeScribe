import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http'; 

import AuthRoute from './routes/auth.routes.js';
import CodeRunnerRoute from './routes/codeRunner.routes.js';
import connectDB from './db/connectDB.js'; 
import initSocket from './socket/socket.js';
import codeAssistantRoute from './routes/codeAssistant.routes.js';
import pdfExportroute from './routes/pdfExport.routes.js';
import roomRouter from './routes/room.route.js';
import { verifyJWT } from './middleware/auth.middleware.js';

const app = express();
const PORT = process.env.PORT || 8000;

const LOCAL_URL = process.env.LOCAL_URL;
const PRODUCTION_URL = process.env.PRODUCTION_URL;

const httpServer = http.createServer(app);

initSocket(httpServer);

// Middlewares
app.use(express.json());
app.use(cookieParser()); 
app.use(cors({
    origin: [LOCAL_URL, PRODUCTION_URL],
    credentials: true,
}));

// Routes
app.use('/api/v1/auth', AuthRoute);

app.use(verifyJWT);
app.use('/api/v1/execute', CodeRunnerRoute);
app.use('/api/v1/codeAssistant', codeAssistantRoute); 
app.use("/api/v1/room", roomRouter);
app.use("/api/v1/export", pdfExportroute);


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
