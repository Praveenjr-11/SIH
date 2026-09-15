import { Router } from 'express';
import { getAllParcels, getParcelByUlpin, getParcelGeoJSON } from '../controllers/parcelsController.js';
import { authenticateOfficerToken, requireRole, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { advanceVerificationStatus, VERIFICATION_STATES } from '../services/verificationService.js';
import { Response } from 'express';

const router = Router();

// Public endpoints (citizens can access — rate-limited in server.ts)
router.get('/', getAllParcels);
router.get('/geojson', getParcelGeoJSON);
router.get('/:ulpin', getParcelByUlpin);

/**
 * PATCH /api/v1/parcels/:ulpin/verification
 * Advance a parcel's verification_status by exactly one step in the state machine.
 * Requires: Tahsildar or above (level_rank <= 5).
 * Body: { "target_status": "FIELD_SURVEYED" | "REGISTRAR_ENDORSED" | "IMMUTABLE" }
 */
router.patch(
  '/:ulpin/verification',
  authenticateOfficerToken,
  requireRole(['TAHSILDAR', 'RDO', 'DRO', 'DISTRICT_COLLECTOR', 'STATE_OFFICER', 'SYSTEM_ADMIN']),
  async (req: AuthenticatedRequest, res: Response) => {
    const { ulpin } = req.params;
    const { target_status } = req.body;

    if (!target_status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: target_status',
        allowedStatuses: VERIFICATION_STATES
      });
    }

    if (!VERIFICATION_STATES.includes(target_status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid target_status '${target_status}'`,
        allowedStatuses: VERIFICATION_STATES
      });
    }

    const officer = req.officer!;
    const result = await advanceVerificationStatus(
      ulpin,
      target_status,
      officer.id,
      officer.role,
      req.ip
    );

    if (!result.success) {
      const { success: _, ...rest } = result;
      return res.status(400).json({ success: false, ...rest });
    }

    const { success: _, ...rest } = result;
    return res.json({
      success: true,
      message: `Parcel ${ulpin} advanced: ${result.previousStatus} → ${result.newStatus}`,
      ...rest
    });
  }
);

export default router;
