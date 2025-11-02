import { Router } from 'express';
import { AskAI } from '../controller/codeAssistant.controller.js';

const router = Router();

router.route('/ask').post(AskAI); 
// router.route('/debug').post(DebugAI);

export default router;