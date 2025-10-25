import { Router } from 'express';
import { ExecuteCode, CodeOutput } from '../controller/codeRunner.controller.js';

const router = Router();

router.route('/runCode').post(ExecuteCode);

router.route('/result/:token').get(CodeOutput);

export default router;