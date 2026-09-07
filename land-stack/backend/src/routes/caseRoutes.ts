import { Router } from 'express';
import { 
  createLandCase, 
  getCasesList, 
  getCaseDetails, 
  updateCaseStatus,
  approveCase,
  rejectCase,
  requestInfoCase,
  requestInspectionCase
} from '../controllers/caseController.js';
import { authenticateOfficerToken, enforceJurisdiction } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticateOfficerToken as any, enforceJurisdiction as any, createLandCase as any);
router.get('/', authenticateOfficerToken as any, getCasesList as any);
router.get('/:id', authenticateOfficerToken as any, getCaseDetails as any);
router.put('/:id/status', authenticateOfficerToken as any, enforceJurisdiction as any, updateCaseStatus as any);
router.post('/:id/approve', authenticateOfficerToken as any, enforceJurisdiction as any, approveCase as any);
router.post('/:id/reject', authenticateOfficerToken as any, enforceJurisdiction as any, rejectCase as any);
router.post('/:id/request-info', authenticateOfficerToken as any, enforceJurisdiction as any, requestInfoCase as any);
router.post('/:id/request-inspection', authenticateOfficerToken as any, enforceJurisdiction as any, requestInspectionCase as any);

export default router;
