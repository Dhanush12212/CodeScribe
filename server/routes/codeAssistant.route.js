import { Router } from 'express';
import { codeAssistant } from '../controller/codeAssistant.controller';

const router = Router();

router.route('/ask').post(codeAssistant); 

export default router;