import { Router } from 'express';
import { AskAI, DebugAI, AIPrompt, reviewCode } from '../controller/codeAssistant.controller.js';

const router = Router();

router.route('/ask').post(AskAI); 
router.route('/debug').post(DebugAI);
router.route('/AIPrompt').post(AIPrompt);
router.route('/reviewCode').post(reviewCode);

export default router;