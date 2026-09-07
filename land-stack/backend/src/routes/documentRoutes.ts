import { Router } from 'express';
import multer from 'multer';
import { uploadCaseDocument, verifyDocumentAgainstGIS } from '../controllers/documentController.js';
import { authenticateOfficerToken } from '../middleware/authMiddleware.js';

const upload = multer({ dest: 'uploads/docs/' });
const router = Router();

router.post('/upload', authenticateOfficerToken as any, upload.single('file'), uploadCaseDocument as any);
router.get('/verify', authenticateOfficerToken as any, verifyDocumentAgainstGIS as any);

export default router;
