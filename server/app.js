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

const allowedOrigins = [LOCAL_URL, PRODUCTION_URL];
 
app.use(
  cors({
    origin: function (origin, callback) { 
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(express.json());
app.use(cookieParser());

const httpServer = http.createServer(app);
initSocket(httpServer, allowedOrigins);

app.use('/api/v1/auth', AuthRoute);

app.use(verifyJWT);
app.use('/api/v1/execute', CodeRunnerRoute);
app.use('/api/v1/codeAssistant', codeAssistantRoute);
app.use('/api/v1/room', roomRouter);
app.use('/api/v1/export', pdfExportroute);

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
