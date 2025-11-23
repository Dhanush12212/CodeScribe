import { Router } from 'express'; 
import { exportPDF } from '../controller/pdfExport.controller.js';

const router = Router();

router.route('/pdf').post(exportPDF); 

export default router;