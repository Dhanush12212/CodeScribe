import { Router } from 'express';
import { AskAI, DebugAI, AIPrompt } from '../controller/codeAssistant.controller.js';

const router = Router();

router.route('/ask').post(AskAI); 
router.route('/debug').post(DebugAI);
router.route('/AIPrompt').post(AIPrompt);

export default router;