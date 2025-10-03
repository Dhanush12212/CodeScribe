import express from 'express';
import authMiddleware from '../middleware/AuthMiddleware.js';
import {getCode} from '../controller/CodeEditrorController.js';

const router = express.Router();

router.post('/Home', authMiddleware, getCode);

export default router;
