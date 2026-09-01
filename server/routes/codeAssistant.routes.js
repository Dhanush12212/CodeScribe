import { Router } from 'express';
import { AskAI, DebugAI, AIPrompt, reviewCode } from '../controller/codeAssistant.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.route('/ask').post(verifyJWT, AskAI); 
router.route('/debug').post(verifyJWT, DebugAI);
router.route('/AIPrompt').post(verifyJWT, AIPrompt);
router.route('/reviewCode').post(verifyJWT, reviewCode);

export default router;